import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import {
	getUserByEmail,
	getDeletedUserByEmail,
	activateUserByEmail,
} from '@/app/api/queries'

export async function PUT(request: Request) {
	const body = await request.json()
	const { email } = body

	const session = await getServerSession()
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	if (!email) {
		return NextResponse.json({
			received: true,
			status: 400,
			message: 'Email not specified!',
		})
	}

	/* Authorization */
	const [user, deletedUser] = await Promise.all([
		getUserByEmail(session.user?.email as string),
		getDeletedUserByEmail(email),
	])

	if (
		user.permission < config.pages.manageUsers.minPermission ||
		(deletedUser && deletedUser.permission >= user.permission)
	) {
		return NextResponse.json(
			{ error: 'Not enough permissions!' },
			{ status: 403 }
		)
	}

	await activateUserByEmail(email)

	return NextResponse.json({
		received: true,
		status: 200,
		message: 'User activated',
	})
}
