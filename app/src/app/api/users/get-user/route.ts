import { NextResponse } from 'next/server'
import { getUserByEmail } from '@/app/api/queries'
import { getServerSession } from 'next-auth'

export async function POST(request: Request) {
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

	const user = await getUserByEmail(email)

	return NextResponse.json({ user }, { status: 200 })
}
