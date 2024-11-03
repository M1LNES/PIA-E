import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'

import config from '@/app/config'
import { getHashedPasswordByEmail, updateUserPassword } from '@/app/api/queries'

export async function POST(request: Request) {
	const body = await request.json()
	const { email, oldPassword, newPassword, newPasswordConfirm } = body

	const session = await getServerSession()
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	/* Authorization */
	if (email !== session?.user?.email) {
		return NextResponse.json({
			received: true,
			status: 401,
			message: 'Unauthorized to change password!!!',
		})
	}

	const hashedPassword = await getHashedPasswordByEmail(email)

	if (!hashedPassword) {
		return NextResponse.json({
			received: true,
			status: 404,
			message: 'User not found!',
		})
	}

	const isPreviousPasswordSame = bcrypt.compareSync(oldPassword, hashedPassword)

	if (!isPreviousPasswordSame) {
		return NextResponse.json({
			received: true,
			status: 422,
			message: 'You provided the wrong old password!',
		})
	}

	if (newPasswordConfirm !== newPassword) {
		return NextResponse.json({
			received: true,
			status: 422,
			message: 'New password and confirm password are not the same!',
		})
	}

	if (oldPassword === newPassword) {
		return NextResponse.json({
			received: true,
			status: 422,
			message: 'New password is the same as the old password!',
		})
	}

	const newHashedPassword = await bcrypt.hash(newPassword, config.saltRounds)
	await updateUserPassword(email, newHashedPassword)

	return NextResponse.json({
		received: true,
		status: 200,
		message: 'Password successfully changed!',
	})
}
