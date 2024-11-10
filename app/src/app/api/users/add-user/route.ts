import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import config from '@/app/config'
import { getServerSession } from 'next-auth'
import {
	isEmailUsed,
	createUser,
	getUserByEmail,
	getRolePermission,
} from '@/app/api/queries'
import { log } from '@/app/api/logger'

const route = 'POST /api/users/add-user'

export async function POST(request: Request) {
	const session = await getServerSession()
	if (!session) {
		log('warn', route, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	const body = await request.json()
	const { username, email, selectedRole, password, confirmPassword } = body

	if (
		!username ||
		!email ||
		selectedRole === -1 ||
		!password ||
		!confirmPassword
	) {
		log(
			'warn',
			route,
			`User ${session.user?.email} did not specified all the required fields`,
			body
		)
		return NextResponse.json(
			{
				error: 'All fields are required',
			},
			{ status: 400 }
		)
	}

	if (password !== confirmPassword) {
		log(
			'info',
			route,
			`User ${session.user?.email} provided two different passwords`
		)
		return NextResponse.json(
			{
				error: 'Passwords are not same!',
			},
			{ status: 400 }
		)
	}

	if (!config.validation.emailRegex.test(email)) {
		log(
			'info',
			route,
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
	const [user, rolePermission] = await Promise.all([
		getUserByEmail(session.user?.email as string),
		getRolePermission(selectedRole),
	])

	if (
		user.permission < config.pages.manageUsers.minPermission ||
		user.permission <= rolePermission
	) {
		log(
			'warn',
			route,
			`User ${session.user?.email} does not have enough permissions.`
		)
		return NextResponse.json(
			{ error: 'Not enough permissions!' },
			{ status: 403 }
		)
	}

	try {
		const isUsed = await isEmailUsed(email)
		if (isUsed) {
			log(
				'info',
				route,
				`User ${session.user?.email} provided email that is already being used`
			)
			return NextResponse.json(
				{
					error: 'Email is already being used',
				},
				{ status: 409 }
			)
		}

		const hashedPassword = await bcrypt.hash(password, config.saltRounds)
		await createUser(username, selectedRole, email, hashedPassword)
		log(
			'info',
			route,
			`User ${session.user?.email} created new user - ${email}`
		)
		return NextResponse.json(
			{
				message: 'User created successfully',
				status: 200,
			},
			{ status: 200 }
		)
	} catch (error) {
		log('error', route, 'Failed to add user', {
			error: (error as Error).message,
		})
		return NextResponse.json(
			{
				error: 'Internal server error',
			},
			{ status: 500 }
		)
	}
}
