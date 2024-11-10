import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import {
	getUserWithPermissions,
	getDeletedUserByEmail,
	disableUserByEmail,
} from '@/app/api/queries'
import { log } from '@/app/api/logger'

const route = 'PUT /api/users/disabled-user'

export async function PUT(request: Request) {
	const session = await getServerSession()
	if (!session) {
		log('warn', route, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	const body = await request.json()
	const { email } = body

	if (!email) {
		log(
			'warn',
			route,
			`User ${session.user?.email} tried to access endpoint without specifying e-mail address.`
		)
		return NextResponse.json(
			{
				error: 'Email not specified!',
			},
			{ status: 400 }
		)
	}

	/* Authorization */
	try {
		const user = await getUserWithPermissions(session.user?.email as string)
		const deletedUser = await getDeletedUserByEmail(email)

		if (
			!user ||
			user.permission < config.pages.manageUsers.minPermission ||
			(deletedUser && deletedUser.permission >= user.permission)
		) {
			log(
				'warn',
				route,
				`User ${session.user?.email} tried to call endpoint, but did not have enough permissions!`,
				user
			)
			return NextResponse.json(
				{ error: 'Not enough permissions!' },
				{ status: 403 }
			)
		}

		await disableUserByEmail(email)
		log(
			'info',
			route,
			`User ${session.user?.email} successfully disabled ${email}`
		)
		return NextResponse.json(
			{
				message: 'User disabled',
				status: 200,
			},
			{ status: 200 }
		)
	} catch (error) {
		log('error', route, 'Failed to disable user', {
			error: (error as Error).message,
		})
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
