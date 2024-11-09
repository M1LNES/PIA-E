import { NextResponse } from 'next/server'
import { getCommentsByPost } from '@/app/api/queries' // Adjust the import path as necessary
import { log } from '@/app/api/logger'

const route = 'POST /api/public/comments/user'

export async function POST(request: Request) {
	try {
		const { email } = await request.json()

		if (!email) {
			return NextResponse.json({ error: 'Email is required' }, { status: 400 })
		}

		log('debug', route, 'Fetching all comments for email: ', email)

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
		log('error', route, 'Failed to fetch  comments by post', {
			error: (error as Error).message,
		})
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
