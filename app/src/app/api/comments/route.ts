import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import {
	getUserIdByEmail,
	getUserDetailsById,
	insertComment,
} from '@/app/api/queries'
import { log } from '@/app/api/logger'

const route = 'POST /api/comments'

/**
 * Handles the addition of a new comment to a specified post.
 * This route ensures that only authenticated users with sufficient permissions can add comments.
 * It performs validation on the provided data and logs relevant information for tracking.
 *
 * @param {Request} request - The incoming request containing the comment details in JSON format.
 * @returns {Response} - JSON response with the new comment data, error, or status.
 */
export async function POST(request: Request) {
	// Retrieve user session
	const session = await getServerSession()

	if (!session) {
		// Log unauthorized access attempt and respond with 401 error
		log('warn', route, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	try {
		// Retrieve user ID based on session email
		const userId = await getUserIdByEmail(session?.user?.email as string)
		if (!userId) {
			// Log missing user ID (possibly deactivated user) and respond with 422 error
			log(
				'warn',
				route,
				`User ${session.user?.email} was not found in DB! Most likely they are deactivated.`
			)
			return NextResponse.json(
				{ error: 'Not enough permissions!' },
				{ status: 403 }
			)
		}

		/* Authorization */
		// Check if user has sufficient permissions to add comments
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
				{ status: 403 }
			)
		}

		// Parse and validate request body
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
				{ error: 'Missing required fields' },
				{ status: 400 }
			)
		}

		// Insert new comment into the database
		const comment = await insertComment(userId, postId, description)

		// Log success and return the newly created comment
		log(
			'info',
			route,
			`User ${session.user?.email} created new comment!`,
			comment
		)

		// Clear the created_at timestamp before returning response
		comment.created_at = null

		return NextResponse.json(
			{
				message: 'Comment created',
				comment,
			},
			{ status: 201 }
		)
	} catch (error) {
		// Log internal server error details and respond with 500 error
		log('error', route, 'Error occurred during adding new comment', {
			error: (error as Error).message,
		})

		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
