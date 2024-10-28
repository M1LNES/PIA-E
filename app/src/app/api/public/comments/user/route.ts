import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	try {
		const { email } = await request.json()

		// Fetch comments grouped by post ID for the given email
		const result = await sql`
            SELECT post, COUNT(*) as comment_count
            FROM ThreadComments
            JOIN Users ON ThreadComments.author = Users.id
            WHERE Users.email = ${email}
            GROUP BY post;
        `

		// Transform the result into an object with formatted post IDs as keys
		const commentsByPost = result.rows.reduce(
			(acc: Record<string, number>, row) => {
				acc[`post${row.post}`] = row.comment_count // Format the key as "postX"
				return acc
			},
			{}
		)

		return NextResponse.json(commentsByPost, { status: 200 })
	} catch (error) {
		return NextResponse.json(
			{ error: 'An error occurred while fetching comments.' },
			{ status: 500 }
		)
	}
}
