import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import {
	getUserByEmail,
	getUserDetailsById,
	getRolePermission,
	updateUserRole,
} from '@/app/api/queries'
import { log } from '@/app/api/logger'

const route = '/api/users/change-role'

export async function POST(request: Request) {
	const session = await getServerSession()

	if (!session) {
		log('warn', route, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	const body = await request.json()
	const { userId, roleId } = body

	if (!userId || !roleId) {
		log(
			'warn',
			route,
			`User ${session.user?.email} provide invalid values:`,
			body
		)
		return NextResponse.json(
			{
				error: 'Required values are invalid',
			},
			{ status: 422 }
		)
	}

	/* Authorization */
	try {
		const [dbUser, updatedUser, rolePerm] = await Promise.all([
			getUserByEmail(session.user?.email as string),
			getUserDetailsById(userId),
			getRolePermission(roleId),
		])

		if (!dbUser || !updatedUser || rolePerm === undefined) {
			log('warn', route, `User or role not find...`, {
				dbUser,
				updatedUser,
				rolePerm,
			})
			return NextResponse.json(
				{
					error: 'User or role not found',
				},
				{ status: 404 }
			)
		}

		if (
			dbUser.permission < config.pages.manageUsers.minPermission ||
			updatedUser.permission >= dbUser.permission ||
			dbUser.permission <= rolePerm
		) {
			log(
				'warn',
				route,
				`User ${session.user?.email} tried to call endpoint, but did not have enough permissions!`
			)
			return NextResponse.json(
				{ error: 'Not enough permissions!' },
				{ status: 403 }
			)
		}

		await updateUserRole(userId, roleId)
		log(
			'info',
			route,
			`User ${session.user?.email} changed role of ${updatedUser.email}`
		)
		return NextResponse.json(
			{
				message: 'Role successfully changed!',
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
