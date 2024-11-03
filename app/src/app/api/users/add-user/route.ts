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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
	const body = await request.json()
	const { username, email, selectedRole, password, confirmPassword } = body

	const session = await getServerSession()
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	if (
		!username ||
		!email ||
		selectedRole === -1 ||
		!password ||
		!confirmPassword
	) {
		return NextResponse.json({
			received: true,
			status: 400,
			message: 'All fields are required',
		})
	}

	if (password !== confirmPassword) {
		return NextResponse.json({
			received: true,
			status: 400,
			message: 'Passwords are not same!',
		})
	}

	if (!emailRegex.test(email)) {
		return NextResponse.json({
			received: true,
			status: 400,
			message: 'Invalid e-mail address',
		})
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
		return NextResponse.json(
			{ error: 'Not enough permissions!' },
			{ status: 403 }
		)
	}

	try {
		const isUsed = await isEmailUsed(email)
		if (isUsed) {
			return NextResponse.json({
				received: true,
				status: 409,
				message: 'Email is already being used',
			})
		}

		const hashedPassword = await bcrypt.hash(password, config.saltRounds)
		await createUser(username, selectedRole, email, hashedPassword)

		return NextResponse.json({
			received: true,
			status: 200,
			message: 'User created successfully',
		})
	} catch (error) {
		console.error('Database error:', error)
		return NextResponse.json({
			received: true,
			status: 500,
			message: 'Internal server error',
		})
	}
}
