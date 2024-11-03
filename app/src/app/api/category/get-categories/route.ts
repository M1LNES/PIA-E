import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { getAllCategories, getUserByEmail } from '../../queries'

export const revalidate = 1
export const fetchCache = 'force-no-store'

export async function GET() {
	const session = await getServerSession()
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	/* Authorization */

	const user = await getUserByEmail(session.user?.email as string)
	if (
		user.permission < config.pages.createPost.minPermission ||
		user.permission < config.pages.createCategory.minPermission
	) {
		return NextResponse.json(
			{ error: 'Not enough permissions!' },
			{ status: 401 }
		)
	}

	try {
		const categories = await getAllCategories() // Call the new function
		return NextResponse.json({ categories }, { status: 200 })
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 })
	}
}
