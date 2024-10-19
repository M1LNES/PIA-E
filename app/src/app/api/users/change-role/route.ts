import config from '@/app/config'
import { sql } from '@vercel/postgres'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	const body = await request.json()
	const { userId, roleId } = body

	const session = await getServerSession()
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	if (!userId || !roleId) {
		return NextResponse.json({
			received: true,
			status: 422,
			message: 'Required values are invalid',
		})
	}

	/* Authorization */

	const [dbUser, dbUpdatedUser, rolePermission] = await Promise.all([
		sql`SELECT Users.id, Users.username, Users.email, Users.role, Roles.type, Roles.permission
		FROM Users
		LEFT JOIN Roles ON Users.role=Roles.id WHERE Users.email=${session.user?.email}`,

		sql`SELECT Users.id, Users.username, Users.email, Users.role, Roles.type, Roles.permission
		FROM Users
		LEFT JOIN Roles ON Users.role=Roles.id WHERE Users.id=${userId}`,
		sql`SELECT permission FROM Roles WHERE id = ${roleId}`,
	])

	const user = dbUser.rows[0]
	const updatedUser = dbUpdatedUser.rows[0]
	const rolePerm = rolePermission.rows[0].permission

	if (
		user.permission < config.pages.manageUsers.minPermission ||
		updatedUser.permission >= user.permission ||
		user.permission <= rolePerm
	) {
		return NextResponse.json(
			{ error: 'Not enough permissions!' },
			{ status: 403 }
		)
	}

	await sql`UPDATE Users SET role = ${roleId} WHERE id = ${userId}`
	return NextResponse.json({
		received: true,
		status: 200,
		message: 'Role successfuly changed!',
	})
}
