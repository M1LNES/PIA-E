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

	try {
		const result =
			await sql`SELECT Users.id, Users.username, Users.deleted_at, Users.email, Roles.id as roleid
                FROM Users
                LEFT JOIN Roles ON Users.role=Roles.id;
		`
		const users = result.rows
		return NextResponse.json({ users }, { status: 200 })
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 })
	}
}
