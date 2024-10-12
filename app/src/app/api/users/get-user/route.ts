import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	const body = await request.json()
	const { email } = body

	if (!email) {
		return NextResponse.json({
			received: true,
			status: 400,
			message: 'Email not specified!',
		})
	}

	const result =
		await sql`SELECT Users.id, Users.username, Users.email, Users.role, Roles.type
                FROM Users
                LEFT JOIN Roles ON Users.role=Roles.id WHERE Users.email=${email}`

	const user = result.rows[0]
	return NextResponse.json({ user }, { status: 200 })
}
