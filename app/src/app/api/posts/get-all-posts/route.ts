import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { getPostsWithDetails } from '../../queries'
import { log } from '@/app/api/logger'

export const revalidate = 1
export const fetchCache = 'force-no-store'

const route = 'GET /api/posts/get-all-posts'

export async function GET() {
	const session = await getServerSession()

	if (!session) {
		log('warn', route, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	/* Authorization */

	// Posts are visible to anyone, no autorization needed

	try {
		const posts = await getPostsWithDetails()
		log('info', route, `Returning all posts to user ${session.user?.email}`)
		return NextResponse.json({ posts }, { status: 200 })
	} catch (error) {
		log('error', route, 'Failure while fetching posts', {
			error: (error as Error).message,
		})
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
