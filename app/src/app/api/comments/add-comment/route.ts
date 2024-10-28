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
	if (user.permission < config.pages.createPost.minPermission) {
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
			message: 'Missing required fields',
		})
	}

	try {
		const insertResult = await sql`
		WITH inserted_comment AS (
			INSERT INTO ThreadComments (author, post, description)
			VALUES (${id}, ${postId}, ${description})
			RETURNING id, post, description, created_at, author
		)
		SELECT 
			inserted_comment.id, 
			inserted_comment.post, 
			inserted_comment.description, 
			inserted_comment.created_at, 
			Users.username
		FROM inserted_comment
		JOIN Users ON Users.id = inserted_comment.author;
	`

		const comment = insertResult.rows[0]

		// Set `created_at` to null as per your requirement
		comment.created_at = null

		return NextResponse.json({
			received: true,
			status: 200,
			message: 'Comment created',
			comment,
		})
	} catch (error) {
		console.error('Database error:', error)
		return NextResponse.json({
			received: true,
			status: 500,
			message: 'Internal server error',
		})
	}
}
