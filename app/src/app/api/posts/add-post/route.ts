import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { getUserDetailsById, getUserIdByEmail, insertPost } from '../../queries'
import { log } from '@/app/api/logger'

const route = 'POST /api/posts/add-post'

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
				`User ${session.user?.email} tried to add posts, but did not have enough permissions!`,
				user
			)
			return NextResponse.json(
				{ error: 'Not enough permissions!' },
				{ status: 401 }
			)
		}

		const body = await request.json()
		const { title, description, category } = body
		if (!title || !description || category == -1) {
			log(
				'warn',
				route,
				`User ${session.user?.email} tried to add posts, but did not specified all required fields!`,
				body
			)
			return NextResponse.json(
				{
					error: 'All fields are required',
				},
				{ status: 400 }
			)
		}

		await insertPost(title, description, category, userId)
		log('info', route, `User ${session.user?.email} created new post!`)
		return NextResponse.json(
			{
				error: 'Post created',
			},
			{ status: 200 }
		)
	} catch (error) {
		log('error', route, 'Failure while adding new post', {
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
