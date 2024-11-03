import { sql } from '@vercel/postgres'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import config from '@/app/config'

export async function PUT(request: Request) {
	const body = await request.json()
	const { email } = body

	const session = await getServerSession()
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	/* Authorization */

	const [dbUser, dbDeletedUser] = await Promise.all([
		sql`SELECT Users.id, Users.username, Users.email, Users.role, Roles.type, Roles.permission
		FROM Users
		LEFT JOIN Roles ON Users.role=Roles.id WHERE Users.email=${session.user?.email}`,

		sql`SELECT Users.id, Users.username, Users.email, Users.role, Roles.type, Roles.permission
		FROM Users
		LEFT JOIN Roles ON Users.role=Roles.id WHERE Users.email=${email}`,
	])

	const user = dbUser.rows[0]
	const deletedUser = dbDeletedUser.rows[0]

	if (
		user.permission < config.pages.manageUsers.minPermission ||
		deletedUser.permission >= user.permission
	) {
		return NextResponse.json(
			{ error: 'Not enough permissions!' },
			{ status: 403 }
		)
	}

	if (!email) {
		return NextResponse.json({
			received: true,
			status: 400,
			message: 'Email not specified!',
		})
	}

	await sql`UPDATE Users SET deleted_at = NOW() WHERE email = ${email}`

	return NextResponse.json({
		received: true,
		status: 200,
		message: 'User disabled',
	})
}
