import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	const body = await request.json()
	const { userId, roleId } = body

	if (!userId || !roleId) {
		return NextResponse.json({
			received: true,
			status: 422,
			message: 'Required values are invalid',
		})
	}

	await sql`UPDATE Users SET role = ${roleId} WHERE id = ${userId}`
	return NextResponse.json({
		received: true,
		status: 200,
		message: 'Role successfuly changed!',
	})
}
