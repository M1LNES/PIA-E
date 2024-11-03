import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import {
	getUserByEmail,
	checkDuplicateCategory,
	createCategory,
} from '@/app/api/queries'

export async function POST(request: Request) {
	const body = await request.json()
	const { title } = body

	const session = await getServerSession()
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	if (!title) {
		return NextResponse.json({
			received: true,
			status: 400,
			message: 'Title field required',
		})
	}

	/* Authorization */
	const user = await getUserByEmail(session.user?.email as string)
	if (!user || user.permission < config.pages.createCategory.minPermission) {
		return NextResponse.json(
			{ error: 'Not enough permissions!' },
			{ status: 401 }
		)
	}

	try {
		const existingCategory = await checkDuplicateCategory(title)

		if (existingCategory.length > 0) {
			return NextResponse.json({
				received: true,
				status: 409,
				message: 'Category with this title already exists!',
			})
		}

		const newCategory = await createCategory(title)
		return NextResponse.json({
			received: true,
			status: 200,
			category: newCategory,
		})
	} catch (error) {
		console.error('Database error:', error)
		return NextResponse.json({
			received: true,
			status: 500,
			message: 'Internal server error',
		})
	}
}
