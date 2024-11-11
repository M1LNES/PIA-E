import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { getPostsWithDetails } from '../../queries'
import { log } from '@/app/api/logger'

export const revalidate = 1
export const fetchCache = 'force-no-store'

const route = 'GET /api/posts/get-all-posts'

/**
 * Retrieves all posts with additional details.
 * Requires a valid session but does not enforce specific authorization.
 *
 * @returns {Response} - JSON response containing posts or an error message.
 */
export async function GET() {
	const session = await getServerSession()

	// Check if session exists
	if (!session) {
		log('warn', route, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	// Posts are accessible to any authenticated user, no further authorization needed

	try {
		// Fetch all posts with details
		const posts = await getPostsWithDetails()
		log('info', route, `Returning all posts to user ${session.user?.email}`)
		return NextResponse.json({ posts }, { status: 200 })
	} catch (error) {
		// Handle any errors during the data fetching process
		log('error', route, 'Failure while fetching posts', {
			error: (error as Error).message,
		})
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
