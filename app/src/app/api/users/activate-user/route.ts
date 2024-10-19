import config from '@/app/config'
import { sql } from '@vercel/postgres'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	const body = await request.json()
	const { email } = body

	const session = await getServerSession()
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	if (!email) {
		return NextResponse.json({
			received: true,
			status: 400,
			message: 'Email not specified!',
		})
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

	await sql`UPDATE Users SET deleted_at = NULL WHERE email = ${email}`

	return NextResponse.json({
		received: true,
		status: 200,
		message: 'User activated',
	})
}
