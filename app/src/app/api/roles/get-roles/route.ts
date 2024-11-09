import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { getAllRoles, getUserWithPermissions } from '@/app/api/queries'
import { log } from '@/app/api/logger'

export const revalidate = 1
export const fetchCache = 'force-no-store'

const route = 'GET /api/roles/get-roles'

export async function GET() {
	/* Authentization */

	const session = await getServerSession()
	if (!session) {
		log('warn', route, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	/* Authorization */

	try {
		log(
			'debug',
			route,
			`Checking user permission ${session.user?.email} and fetching roles...`
		)
		const user = await getUserWithPermissions(session.user?.email as string)
		if (user.permission < config.pages.manageUsers.minPermission) {
			return NextResponse.json(
				{ error: 'Not enough permissions!' },
				{ status: 401 }
			)
		}
		const roles = await getAllRoles()
		log('info', route, `Returning roles for user ${session.user?.email}`, {
			roles,
		})
		return NextResponse.json({ roles }, { status: 200 })
	} catch (error) {
		log('error', route, 'Failed to fetch roles', {
			error: (error as Error).message,
		})
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
