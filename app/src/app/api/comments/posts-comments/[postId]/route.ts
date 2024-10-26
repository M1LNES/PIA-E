import config from '@/app/config'
import { sql } from '@vercel/postgres'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export const revalidate = 1
export const fetchCache = 'force-no-store'

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ postId: string }> }
) {
	const postId = (await params).postId

	const session = await getServerSession()
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	if (!postId) {
		return NextResponse.json({
			received: true,
			status: 400,
			message: 'Post Id not specified pico',
		})
	}

	/* Authorization */

	const dbUser =
		await sql`SELECT Users.id, Users.username, Users.email, Users.role, Roles.type, Roles.permission
				FROM Users
				LEFT JOIN Roles ON Users.role=Roles.id WHERE Users.email=${session.user?.email}`

	const user = dbUser.rows[0]
	if (user.permission < config.pages.createPost.minPermission) {
		return NextResponse.json(
			{ error: 'Not enough permissions!' },
			{ status: 401 }
		)
	}

	const result =
		await sql`SELECT ThreadComments.id, ThreadComments.author, ThreadComments.post, 
		ThreadComments.id, ThreadComments.description, ThreadComments.created_at,Users.username 
		FROM ThreadComments JOIN Users ON ThreadComments.author = Users.id WHERE post=${postId}`

	const comments = result.rows
	return NextResponse.json(comments, { status: 200 })
}
