import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import {
	getUserByEmail,
	getDeletedUserByEmail,
	activateUserByEmail,
} from '@/app/api/queries'
import { log } from '@/app/api/logger'

const route = 'PUT /api/users/active-user'

export async function PUT(request: Request) {
	const session = await getServerSession()

	if (!session) {
		log('warn', route, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	const body = await request.json()
	const { email } = body

	if (!email) {
		log('info', route, `User ${session.user?.email} did not specify email`)
		return NextResponse.json(
			{
				error: 'Email not specified!',
			},
			{ status: 400 }
		)
	}

	try {
		/* Authorization */
		const [user, deletedUser] = await Promise.all([
			getUserByEmail(session.user?.email as string),
			getDeletedUserByEmail(email),
		])

		if (
			user.permission < config.pages.manageUsers.minPermission ||
			(deletedUser && deletedUser.permission >= user.permission)
		) {
			log(
				'warn',
				route,
				`User ${session.user?.email} does not have enough permissions.`
			)
			return NextResponse.json(
				{ error: 'Not enough permissions!' },
				{ status: 403 }
			)
		}

		await activateUserByEmail(email)
		log('info', route, `User ${session.user?.email} re-activated user ${email}`)
		return NextResponse.json(
			{
				message: 'User activated',
				status: 200,
			},
			{ status: 200 }
		)
	} catch (error) {
		log('error', route, 'Failed to activate user', {
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
