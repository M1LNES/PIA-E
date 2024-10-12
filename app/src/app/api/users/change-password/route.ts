import { sql } from '@vercel/postgres'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

export async function POST(request: Request) {
	const body = await request.json()
	const { email, oldPassword, newPassword, newPasswordConfirm } = body

	const session = await getServerSession()

	if (email !== session?.user?.email) {
		return NextResponse.json({
			received: true,
			status: 401,
			message: 'Unauthorized to change password!!!',
		})
	}

	const userPasswordReq =
		await sql`SELECT hashed_password from Users WHERE email=${email}`
	const row = userPasswordReq.rows

	const hashedPassword = row[0]?.hashed_password

	const isPreviousPasswordSame = bcrypt.compareSync(oldPassword, hashedPassword)

	if (!isPreviousPasswordSame) {
		return NextResponse.json({
			received: true,
			status: 422,
			message: 'You provided wrong old password!',
		})
	}

	if (newPasswordConfirm !== newPassword) {
		return NextResponse.json({
			received: true,
			status: 422,
			message: 'New password and confirm password are not same!',
		})
	}

	if (oldPassword === newPassword) {
		return NextResponse.json({
			received: true,
			status: 422,
			message: 'New password is same as the old password!',
		})
	}

	await sql`UPDATE Users SET hashed_password = ${await bcrypt.hash(
		newPassword,
		SALT_ROUNDS
	)} WHERE email=${email}`

	return NextResponse.json({
		received: true,
		status: 200,
		message: 'Password successfully changed!',
	})
}
