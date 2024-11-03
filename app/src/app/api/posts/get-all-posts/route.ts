import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { getPostsWithDetails } from '../../queries'

export const revalidate = 1
export const fetchCache = 'force-no-store'

export async function GET() {
	const session = await getServerSession()
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	/* Authorization */

	// Posts are visible to anyone, no autorization needed

	try {
		const posts = await getPostsWithDetails()
		return NextResponse.json({ posts }, { status: 200 })
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 })
	}
}
