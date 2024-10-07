import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10
export async function POST(request: Request) {
	const body = await request.json()
	const { username, email, selectedRole, password, confirmPassword } = body

	if (!username || !email || !selectedRole || !password || !confirmPassword) {
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

	if (!email.includes('@')) {
		// TODO ADD REGEX TO VALIDATE E MAIL
		return NextResponse.json({
			received: true,
			status: 400,
			message: 'Invalid e-mail address',
		})
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
			SALT_ROUNDS
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
