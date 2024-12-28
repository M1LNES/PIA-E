import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import config from '@/app/config'
import { getServerSession } from 'next-auth'
import {
	isEmailUsed,
	createUser,
	getUserByEmail,
	getRolePermission,
	getAllUsersWithRoles,
	getUserWithPermissions,
} from '@/app/api/utils/queries'
import { log } from '@/app/api/utils/logger'

const route = '/api/users'

/**
 * API Route: POST /api/users
 *
 * This route allows an authenticated user with the necessary permissions to create a new user.
 * It first verifies that all required fields are provided, checks that the passwords match, validates
 * the email format, checks the permissions of the requesting user, and then adds the new user to the system.
 *
 * @returns {NextResponse} - A response indicating success or failure of the user creation process.
 */
export async function POST(request: Request) {
	/* Authentication */
	// Get the current session to check if the user is authenticated
	const session = await getServerSession()
	if (!session) {
		// Log and return a 401 Unauthorized response if the user is not authenticated
		log('warn', `${route} - POST`, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	// Parse the request body to extract user details
	const body = await request.json()
	const { username, email, selectedRole, password, confirmPassword } = body

	// Validate that all required fields are provided
	if (
		!username ||
		!email ||
		selectedRole === -1 ||
		!password ||
		!confirmPassword
	) {
		log(
			'warn',
			`${route} - POST`,
			`User ${session.user?.email} did not specify all the required fields`,
			body
		)
		return NextResponse.json(
			{
				error: 'All fields are required',
			},
			{ status: 400 }
		)
	}

	// Check if the passwords match
	if (password !== confirmPassword) {
		log(
			'info',
			`${route} - POST`,
			`User ${session.user?.email} provided two different passwords`
		)
		return NextResponse.json(
			{
				error: 'Passwords are not same!',
			},
			{ status: 400 }
		)
	}

	// Validate the email format using a regular expression
	if (!config.validation.emailRegex.test(email)) {
		log(
			'info',
			`${route} - POST`,
			`User ${session.user?.email} provided invalid email address`
		)
		return NextResponse.json(
			{
				error: 'Invalid e-mail address',
			},
			{ status: 400 }
		)
	}

	/* Authorization */
	// Fetch the current user and the role permissions for the selected role
	const [user, rolePermission] = await Promise.all([
		getUserByEmail(session.user?.email as string), // Get the requesting user's data
		getRolePermission(selectedRole), // Get the permissions for the selected role
	])

	// Check if the current user has sufficient permissions to create users
	// and if the selected role is not higher than the current user's role
	if (
		user.permission < config.pages.manageUsers.minPermission || // Check if the user has the required permission
		user.permission <= rolePermission // Check if the selected role has lower or equal permissions to the user's role
	) {
		log(
			'warn',
			`${route} - POST`,
			`User ${session.user?.email} does not have enough permissions.`
		)
		// Return a 403 Forbidden response if the user doesn't have the required permissions
		return NextResponse.json(
			{ error: 'Not enough permissions!' },
			{ status: 403 }
		)
	}

	try {
		// Check if the email is already in use
		const isUsed = await isEmailUsed(email)
		if (isUsed) {
			log(
				'info',
				`${route} - POST`,
				`User ${session.user?.email} provided email that is already being used`
			)
			// Return a 409 Conflict response if the email is already registered
			return NextResponse.json(
				{
					error: 'Email is already being used',
				},
				{ status: 409 }
			)
		}

		// Hash the user's password before saving it to the database
		const hashedPassword = await bcrypt.hash(password, config.saltRounds)
		// Create the new user with the specified details
		await createUser(username, selectedRole, email, hashedPassword)
		log(
			'info',
			`${route} - POST`,
			`User ${session.user?.email} created new user - ${email}`
		)

		// Return a success message if the user was created successfully
		return NextResponse.json(
			{
				message: 'User created successfully',
			},
			{ status: 201 }
		)
	} catch (error) {
		// Log any errors that occurred during the process
		log('error', `${route} - POST`, 'Failed to add user', {
			error: (error as Error).message,
		})

		// Return a 500 Internal Server Error response if an unexpected error occurred
		return NextResponse.json(
			{
				error: 'Internal server error',
			},
			{ status: 500 }
		)
	}
}

/**
 * API route handler for fetching all users with their roles.
 *
 * This function is responsible for ensuring that only authorized users with sufficient
 * permissions can access the list of all users. The logged-in user must have at least
 * the minimum required permissions to manage users.
 *
 * @returns A JSON response containing the list of users with roles, or an error message
 *          if the user is unauthorized, lacks permissions, or if there's an internal error.
 */
export async function GET() {
	// Get the session of the current user
	const session = await getServerSession()

	// If no session is found, return an unauthorized response
	if (!session) {
		log('warn', `${route} - GET`, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	try {
		// Fetch the logged-in user's permissions
		const user = await getUserWithPermissions(session.user?.email as string)

		// Check if the logged-in user has sufficient permissions to manage users
		if (user?.permission < config.pages.manageUsers.minPermission) {
			log(
				'warn',
				`${route} - GET`,
				`User ${session.user?.email} tried to call endpoint, but did not have enough permissions!`,
				user
			)
			return NextResponse.json(
				{ error: 'Not enough permissions!' },
				{ status: 403 }
			)
		}

		// Fetch all users with their roles
		const users = await getAllUsersWithRoles()

		// Log and return the list of users
		log(
			'info',
			`${route} - GET`,
			`Returned all users for user ${session.user?.email}`,
			{
				users,
			}
		)
		return NextResponse.json({ users }, { status: 200 })
	} catch (error) {
		// Log any errors and return a server error response
		log('error', `${route} - GET`, 'Failed to fetch users', {
			error: (error as Error).message,
		})
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
