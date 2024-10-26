import config from '@/app/config'
import { sql } from '@vercel/postgres'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	const session = await getServerSession()
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	// Finding user's ID based on his e-mail
	const result =
		await sql`SELECT id FROM Users WHERE deleted_at IS NULL AND email=${session?.user?.email}`

	if (result.rows.length !== 1) {
		return NextResponse.json({
			received: true,
			status: 422,
			message: 'User not found in DB!',
		})
	}

	const id = result.rows[0]?.id

	/* Authorization */

	const dbUser =
		await sql`SELECT Users.id, Users.username, Users.email, Users.role, Roles.type, Roles.permission
					FROM Users
					LEFT JOIN Roles ON Users.role=Roles.id WHERE Users.id=${id}`

	const user = dbUser.rows[0]
	if (user.permission < config.pages.home.minPermission) {
		return NextResponse.json(
			{ error: 'Not enough permissions!' },
			{ status: 401 }
		)
	}

	const body = await request.json()
	const { description, postId } = body
	if (!description || !id || !postId) {
		return NextResponse.json({
			received: true,
			status: 400,
			message: 'TODO TODO',
		})
	}

	try {
		await sql`
		    INSERT INTO ThreadComments (author, post, description)
		    VALUES (${id}, ${postId}, ${description}) RETURNING *;
		  `
		return NextResponse.json({
			received: true,
			status: 200,
			message: 'Comment created',
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
