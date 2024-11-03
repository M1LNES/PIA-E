import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import {
	getUserByEmail,
	getUserDetailsById,
	getRolePermission,
	updateUserRole,
} from '@/app/api/queries'

export async function POST(request: Request) {
	const body = await request.json()
	const { userId, roleId } = body

	const session = await getServerSession()
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	if (!userId || !roleId) {
		return NextResponse.json({
			received: true,
			status: 422,
			message: 'Required values are invalid',
		})
	}

	/* Authorization */

	const [dbUser, updatedUser, rolePerm] = await Promise.all([
		getUserByEmail(session.user?.email as string),
		getUserDetailsById(userId),
		getRolePermission(roleId),
	])

	if (!dbUser || !updatedUser || rolePerm === undefined) {
		return NextResponse.json({
			received: true,
			status: 404,
			message: 'User or role not found',
		})
	}

	if (
		dbUser.permission < config.pages.manageUsers.minPermission ||
		updatedUser.permission >= dbUser.permission ||
		dbUser.permission <= rolePerm
	) {
		return NextResponse.json(
			{ error: 'Not enough permissions!' },
			{ status: 403 }
		)
	}

	await updateUserRole(userId, roleId)
	return NextResponse.json({
		received: true,
		status: 200,
		message: 'Role successfully changed!',
	})
}
