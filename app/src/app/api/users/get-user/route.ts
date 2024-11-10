import { NextResponse } from 'next/server'
import { getUserByEmail } from '@/app/api/queries'
import { getServerSession } from 'next-auth'
import { log } from '@/app/api/logger'

const route = 'POST /api/users/get-user'

export async function POST(request: Request) {
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

	if (email !== session?.user?.email) {
		log(
			'warn',
			route,
			`User ${session.user?.email} tried to access other user's (${email}) data!`
		)
		return NextResponse.json(
			{
				error: 'Unauthorized to get user info',
			},
			{ status: 401 }
		)
	}
	try {
		const user = await getUserByEmail(email)
		log('info', route, `Returned info about user ${session.user?.email}`)
		return NextResponse.json({ user }, { status: 200 })
	} catch (error) {
		log('error', route, 'Failed to fetch user', {
			error: (error as Error).message,
		})
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
