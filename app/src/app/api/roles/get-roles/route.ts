import config from '@/app/config'
import { sql } from '@vercel/postgres'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export const revalidate = 1
export const fetchCache = 'force-no-store'

export async function GET() {
	const session = await getServerSession()
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	/* Authorization */
	const dbUser =
		await sql`SELECT Users.id, Users.username, Users.email, Users.role, Roles.type, Roles.permission
					FROM Users
					LEFT JOIN Roles ON Users.role=Roles.id WHERE Users.email=${session.user?.email}`

	const user = dbUser.rows[0]
	if (user.permission < config.pages.manageUsers.minPermission) {
		return NextResponse.json(
			{ error: 'Not enough permissions!' },
			{ status: 401 }
		)
	}

	try {
		const result = await sql`SELECT * FROM Roles;
		`
		const roles = result.rows
		return NextResponse.json({ roles }, { status: 200 })
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 })
	}
}
