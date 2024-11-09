import { getCommentsByPostId, getUserWithPermissions } from '@/app/api/queries'
import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { log } from '@/app/api/logger'

export const revalidate = 1
export const fetchCache = 'force-no-store'

const route = 'GET /api/comments/posts-comments/:postId'

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ postId: string }> }
) {
	const postId = (await params).postId
	const session = await getServerSession()

	if (!session) {
		log('warn', route, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	try {
		if (!postId) {
			log('warn', route, `User ${session.user?.email} did not specify postId`)
			return NextResponse.json(
				{
					error: 'Post Id not specified',
				},
				{ status: 400 }
			)
		}

		/* Authorization */

		const user = await getUserWithPermissions(session.user?.email as string)
		if (user.permission < config.pages.home.minPermission) {
			log('warn', route, `User ${session.user?.email} did not specify postId`)
			return NextResponse.json(
				{ error: 'Not enough permissions!' },
				{ status: 401 }
			)
		}

		const comments = await getCommentsByPostId(postId) // Call the new function
		log(
			'info',
			route,
			`Returning comments for user (${session.user?.email}) at post ${postId}:`,
			{ comments }
		)

		return NextResponse.json(comments, { status: 200 })
	} catch (error) {
		log('error', route, 'Error occured during loading post comments.', {
			error: (error as Error).message,
		})

		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
