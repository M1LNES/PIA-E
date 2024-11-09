import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import {
	getUserByEmail,
	checkDuplicateCategory,
	createCategory,
} from '@/app/api/queries'
import { log } from '@/app/api/logger'

const route = 'POST /api/category/add-category'

export async function POST(request: Request) {
	const body = await request.json()
	const { title } = body

	const session = await getServerSession()
	if (!session) {
		log('warn', route, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	if (!title) {
		log(
			'warn',
			route,
			`${session.user?.email} passed empty title while creating category.`
		)
		return NextResponse.json(
			{
				received: true,
				message: 'Title field required',
			},
			{ status: 400 }
		)
	}

	try {
		/* Authorization */
		log(
			'debug',
			route,
			`Checking ${session.user?.email}'s permission, duplicates and creating category...`
		)

		const user = await getUserByEmail(session.user?.email as string)

		if (!user || user.permission < config.pages.createCategory.minPermission) {
			return NextResponse.json(
				{ error: 'Not enough permissions!' },
				{ status: 401 }
			)
		}

		const existingCategory = await checkDuplicateCategory(title)

		if (existingCategory.length > 0) {
			return NextResponse.json(
				{
					received: true,
					message: 'Category with this title already exists!',
				},
				{ status: 409 }
			)
		}

		const newCategory = await createCategory(title)

		log(
			'info',
			route,
			`${session.user?.email} successfully created new category.`,
			newCategory
		)

		return NextResponse.json({
			received: true,
			status: 200,
			category: newCategory,
		})
	} catch (error) {
		log('error', route, 'Failure while adding category', {
			error: (error as Error).message,
		})
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
