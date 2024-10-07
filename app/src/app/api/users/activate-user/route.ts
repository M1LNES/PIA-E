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

	await sql`UPDATE Users SET deleted_at = NULL WHERE email = ${email}`

	return NextResponse.json({
		received: true,
		status: 200,
		message: 'User activated',
	})
}
