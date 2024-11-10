import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { getAllUsersWithRoles, getUserWithPermissions } from '../../queries'
import { log } from '@/app/api/logger'

export const revalidate = 1
export const fetchCache = 'force-no-store'

const route = 'GET /api/users/get-all-users'

export async function GET() {
	const session = await getServerSession()

	if (!session) {
		log('warn', route, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	try {
		const user = await getUserWithPermissions(session.user?.email as string)
		if (user?.permission < config.pages.manageUsers.minPermission) {
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

		const users = await getAllUsersWithRoles()
		log('info', route, `Returned all users for user ${session.user?.email}`, {
			users,
		})
		return NextResponse.json({ users }, { status: 200 })
	} catch (error) {
		log('error', route, 'Failed to fetch users', {
			error: (error as Error).message,
		})
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
