import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { getAllRoles, getUserWithPermissions } from '@/app/api/queries'

export const revalidate = 1
export const fetchCache = 'force-no-store'

export async function GET() {
	const session = await getServerSession()
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	/* Authorization */

	const user = await getUserWithPermissions(session.user?.email as string)
	if (user.permission < config.pages.manageUsers.minPermission) {
		return NextResponse.json(
			{ error: 'Not enough permissions!' },
			{ status: 401 }
		)
	}

	try {
		const roles = await getAllRoles()
		return NextResponse.json({ roles }, { status: 200 })
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 })
	}
}
