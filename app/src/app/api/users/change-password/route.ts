import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import config from '@/app/config'
import { getHashedPasswordByEmail, updateUserPassword } from '@/app/api/queries'
import { log } from '@/app/api/logger'

const route = 'POST /api/users/change-password'

export async function POST(request: Request) {
	const session = await getServerSession()

	if (!session) {
		log('warn', route, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	const body = await request.json()
	const { email, oldPassword, newPassword, newPasswordConfirm } = body

	/* Authorization */
	if (email !== session?.user?.email) {
		log(
			'warn',
			route,
			`User ${session.user?.email} tried to access other user's (${email}) data!`
		)
		return NextResponse.json(
			{
				error: 'Unauthorized to change password!!!',
			},
			{ status: 401 }
		)
	}

	try {
		const hashedPassword = await getHashedPasswordByEmail(email)

		if (!hashedPassword) {
			log(
				'warn',
				route,
				`User ${session.user?.email} was not found in DB! Most likely he is deactivated.`
			)
			return NextResponse.json(
				{
					error: 'User not found!',
				},
				{ status: 404 }
			)
		}

		const isPreviousPasswordSame = bcrypt.compareSync(
			oldPassword,
			hashedPassword
		)

		if (!isPreviousPasswordSame) {
			log(
				'info',
				route,
				`User ${session.user?.email} provided wrong old password.`
			)
			return NextResponse.json(
				{
					error: 'You provided the wrong old password!',
				},
				{ status: 422 }
			)
		}

		if (newPasswordConfirm !== newPassword) {
			log('info', route, `${session.user?.email}'s password were not same.`)
			return NextResponse.json(
				{
					error: 'New password and confirm password are not the same!',
				},
				{ status: 422 }
			)
		}

		if (oldPassword === newPassword) {
			log(
				'info',
				route,
				`${session.user?.email}'s new and old passwords were same.`
			)
			return NextResponse.json(
				{
					error: 'New password is the same as the old password!',
				},
				{ status: 422 }
			)
		}

		const newHashedPassword = await bcrypt.hash(newPassword, config.saltRounds)
		await updateUserPassword(email, newHashedPassword)
		log(
			'info',
			route,
			`${session.user?.email} successfully changed his password`
		)
		return NextResponse.json(
			{
				message: 'Password successfully changed!',
				status: 200,
			},
			{ status: 200 }
		)
	} catch (error) {
		log('error', route, 'Failed to change password', {
			error: (error as Error).message,
		})
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
