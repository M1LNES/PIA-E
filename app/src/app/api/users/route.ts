import { NextResponse } from 'next/server'
import { log } from '@/app/api/utils/logger'
import { AppError } from '../utils/errors'
import { createNewUser, getAllUsers } from '../service/user-service'

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
export async function POST(request: Request): Promise<NextResponse> {
	try {
		// Parse the request body to extract user details
		const body = await request.json()
		const { username, emailAddress, selectedRole, password, confirmPassword } =
			body

		await createNewUser(
			username,
			emailAddress,
			selectedRole,
			password,
			confirmPassword
		)
		log('info', `POST ${route}`, `Created new user: ${emailAddress}`)

		// Return a success message if the user was created successfully
		return NextResponse.json(
			{
				message: 'User created successfully',
			},
			{ status: 201 }
		)
	} catch (error) {
		if (error instanceof AppError) {
			log('warn', route, error.description)
			return NextResponse.json(
				{ error: error.message },
				{ status: error.statusCode }
			)
		}
		// Log any errors that occurred during the process
		log('error', `POST ${route}`, 'Failed to add user', {
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
export async function GET(): Promise<NextResponse> {
	try {
		const users = await getAllUsers()
		// Log and return the list of users
		log('info', `GET ${route}`, `Returned all users.`, {
			users,
		})
		return NextResponse.json({ users }, { status: 200 })
	} catch (error) {
		if (error instanceof AppError) {
			log('warn', route, error.description)
			return NextResponse.json(
				{ error: error.message },
				{ status: error.statusCode }
			)
		}

		// Log any errors and return a server error response
		log('error', `GET ${route}`, 'Failed to fetch users', {
			error: (error as Error).message,
		})
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
