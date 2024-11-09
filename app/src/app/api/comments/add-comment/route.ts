import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import {
	getUserIdByEmail,
	getUserDetailsById,
	insertComment,
} from '@/app/api/queries'
import { log } from '@/app/api/logger'

const route = 'POST /api/comments/add-comment'

export async function POST(request: Request) {
	const session = await getServerSession()

	if (!session) {
		log('warn', route, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	try {
		const userId = await getUserIdByEmail(session?.user?.email as string)
		if (!userId) {
			log(
				'warn',
				route,
				`User ${session.user?.email} was not found in DB! Most likely he is deactivated.`
			)
			return NextResponse.json(
				{
					error: 'User not found in DB!',
				},
				{ status: 422 }
			)
		}

		/* Authorization */
		const user = await getUserDetailsById(userId)
		if (user.permission < config.pages.createPost.minPermission) {
			log(
				'warn',
				route,
				`User ${session.user?.email} tried to add comment, but did not have enough permissions!`,
				user
			)
			return NextResponse.json(
				{ error: 'Not enough permissions!' },
				{ status: 401 }
			)
		}

		const body = await request.json()
		const { description, postId } = body
		if (!description || !postId) {
			log(
				'warn',
				route,
				`User ${session.user?.email} did not specify description or postId:`,
				body
			)
			return NextResponse.json(
				{
					error: 'Missing required fields',
				},
				{ status: 400 }
			)
		}

		const comment = await insertComment(userId, postId, description)

		log(
			'info',
			route,
			`User ${session.user?.email} created new comment!`,
			comment
		)

		comment.created_at = null

		return NextResponse.json({
			received: true,
			status: 200,
			message: 'Comment created',
			comment,
		})
	} catch (error) {
		log('error', route, 'Error occured during adding new comment', {
			error: (error as Error).message,
		})

		return NextResponse.json(
			{
				error: 'Internal server error',
			},
			{ status: 500 }
		)
	}
}
