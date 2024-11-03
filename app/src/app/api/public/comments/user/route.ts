import { NextResponse } from 'next/server'
import { getCommentsByPost } from '@/app/api/queries' // Adjust the import path as necessary

export async function POST(request: Request) {
	try {
		const { email } = await request.json()

		if (!email) {
			return NextResponse.json({ error: 'Email is required' }, { status: 400 })
		}

		// Fetch comments grouped by post ID for the given email
		const commentsByPostRows = await getCommentsByPost(email)

		// Transform the result into an object with formatted post IDs as keys
		const commentsByPost = commentsByPostRows.reduce(
			(acc: Record<string, number>, row) => {
				acc[`post${row.post}`] = row.comment_count // Format the key as "postX"
				return acc
			},
			{}
		)

		return NextResponse.json(commentsByPost, { status: 200 })
	} catch (error) {
		console.error('Error fetching comments by post:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
