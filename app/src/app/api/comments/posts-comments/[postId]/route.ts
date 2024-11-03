import { getCommentsByPostId, getUserWithPermissions } from '@/app/api/queries'
import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export const revalidate = 1
export const fetchCache = 'force-no-store'

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ postId: string }> }
) {
	const postId = (await params).postId

	const session = await getServerSession()
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	if (!postId) {
		return NextResponse.json({
			received: true,
			status: 400,
			message: 'Post Id not specified pico',
		})
	}

	/* Authorization */

	const user = await getUserWithPermissions(session.user?.email as string)
	if (user.permission < config.pages.home.minPermission) {
		return NextResponse.json(
			{ error: 'Not enough permissions!' },
			{ status: 401 }
		)
	}

	const comments = await getCommentsByPostId(postId) // Call the new function

	return NextResponse.json(comments, { status: 200 })
}
