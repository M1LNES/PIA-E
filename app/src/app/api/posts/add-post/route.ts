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
	const { title, description, category } = body
	if (!title || !description || category == -1 || !id) {
		return NextResponse.json({
			received: true,
			status: 400,
			message: 'All fields are required',
		})
	}

	try {
		await sql`
		    INSERT INTO posts (title, description, category, author)
		    VALUES (${title}, ${description}, ${category}, ${id}) RETURNING *;
		  `
		return NextResponse.json({
			received: true,
			status: 200,
			message: 'Post created',
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
