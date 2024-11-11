import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { getUserDetailsById, getUserIdByEmail, insertPost } from '../../queries'
import { log } from '@/app/api/logger'

const route = 'POST /api/posts/add-post'

/**
 * Adds a new post by the authenticated user if they have sufficient permissions.
 * Requires a valid session and checks for mandatory fields.
 *
 * @param {Request} request - Incoming request object.
 * @returns {Response} - JSON response indicating success or error.
 */
export async function POST(request: Request) {
	const session = await getServerSession()
	if (!session) {
		// Log unauthorized access attempt and respond with 401 error
		log('warn', route, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	try {
		// Check if user exists in the database
		const userId = await getUserIdByEmail(session?.user?.email as string)
		if (!userId) {
			log(
				'warn',
				route,
				`User ${session.user?.email} was not found in DB! Most likely they are deactivated.`
			)
			return NextResponse.json(
				{ error: 'User not found in DB!' },
				{ status: 422 }
			)
		}

		/* Authorization */

		// Verify if user has the required permission level to add a post
		const user = await getUserDetailsById(userId)
		if (user.permission < config.pages.createPost.minPermission) {
			log(
				'warn',
				route,
				`User ${session.user?.email} tried to add posts but lacked permission.`,
				user
			)
			return NextResponse.json(
				{ error: 'Not enough permissions!' },
				{ status: 401 }
			)
		}

		// Parse and validate the request body fields
		const body = await request.json()
		const { title, description, category } = body
		if (!title || !description || category == -1) {
			log(
				'warn',
				route,
				`User ${session.user?.email} did not specify all required fields.`,
				body
			)
			return NextResponse.json(
				{ error: 'All fields are required' },
				{ status: 400 }
			)
		}

		// Insert the new post into the database
		await insertPost(title, description, category, userId)
		log('info', route, `User ${session.user?.email} created a new post!`)

		return NextResponse.json(
			{ message: 'Post created successfully', status: 200 },
			{ status: 200 }
		)
	} catch (error) {
		// Log any errors that occur during post creation
		log('error', route, 'Failure while adding new post', {
			error: (error as Error).message,
		})
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
