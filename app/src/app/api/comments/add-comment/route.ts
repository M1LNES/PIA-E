import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import {
	getUserIdByEmail,
	getUserDetailsById,
	insertComment,
} from '@/app/api/queries'

export async function POST(request: Request) {
	const session = await getServerSession()
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	const userId = await getUserIdByEmail(session?.user?.email as string)
	if (!userId) {
		return NextResponse.json({
			received: true,
			status: 422,
			message: 'User not found in DB!',
		})
	}

	/* Authorization */
	const user = await getUserDetailsById(userId)
	if (user.permission < config.pages.createPost.minPermission) {
		return NextResponse.json(
			{ error: 'Not enough permissions!' },
			{ status: 401 }
		)
	}

	const body = await request.json()
	const { description, postId } = body
	if (!description || !postId) {
		return NextResponse.json({
			received: true,
			status: 400,
			message: 'Missing required fields',
		})
	}

	try {
		const comment = await insertComment(userId, postId, description)

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
