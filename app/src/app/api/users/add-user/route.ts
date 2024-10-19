import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import config from '@/app/config'
import { getServerSession } from 'next-auth'

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

	const [dbUser, rolePermission] = await Promise.all([
		sql`SELECT Users.id, Users.username, Users.email, Users.role, Roles.type, Roles.permission
		FROM Users
		LEFT JOIN Roles ON Users.role=Roles.id WHERE Users.email=${session.user?.email}`,
		sql`SELECT permission FROM Roles WHERE id = ${selectedRole}`,
	])

	const user = dbUser.rows[0]
	const rolePerm = rolePermission.rows[0].permission

	if (
		user.permission < config.pages.manageUsers.minPermission ||
		user.permission <= rolePerm
	) {
		return NextResponse.json(
			{ error: 'Not enough permissions!' },
			{ status: 403 }
		)
	}

	try {
		const existingUsersQuery = await sql`SELECT email FROM Users`
		const existingUsers = existingUsersQuery.rows

		const isEmailUsed = existingUsers.some((user) => user.email === email)
		if (isEmailUsed) {
			return NextResponse.json({
				received: true,
				status: 409,
				message: 'Email is already being used',
			})
		}

		await sql`INSERT INTO Users (username, role, email, hashed_password) VALUES (${username}, ${selectedRole}, ${email},${await bcrypt.hash(
			password,
			config.saltRounds
		)}) RETURNING *`

		return NextResponse.json({
			received: true,
			status: 200,
			message: 'Post created',
		})
	} catch (error) {
		console.error('Database error:', error)
		return NextResponse.json({
			received: true,
			status: 500,
			message: 'Inernal server error',
		})
	}
}
