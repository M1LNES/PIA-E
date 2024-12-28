import { NextResponse } from 'next/server'
import { log } from '@/app/api/utils/logger'
import { createNewCategory, getCategories } from '../service/category-service'
import { AppError } from '../utils/errors'
import { CategoryDomain } from '@/dto/types'

export const revalidate = 1
export const fetchCache = 'force-no-store'

const route = '/api/categories'

/**
 * Handles HTTP GET and POST requests for the /api/categories endpoint.
 * - GET: Fetch all categories.
 * - POST: Create a new category.
 *
 * @param {Request} request - The incoming request object.
 * @returns {NextResponse} - JSON response with status and details of the operation.
 */
export async function GET() {
	try {
		const categories = <CategoryDomain[]>await getCategories()
		log('info', `GET ${route}`, 'Returning categories')

		return NextResponse.json({ categories }, { status: 200 })
	} catch (error) {
		if (error instanceof AppError) {
			log('warn', `GET ${route}`, error.description)
			return NextResponse.json(
				{ error: error.message },
				{ status: error.statusCode }
			)
		}

		log('error', route, 'Internal Server Error', { error })
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json()
		const { title } = body

		const newCategory = await createNewCategory(title)
		log(
			'info',
			`${route} - POST`,
			`Successfully created new category.`,
			newCategory
		)

		return NextResponse.json(
			{
				message: 'Category created',
			},
			{ status: 201 }
		)
	} catch (error) {
		// Log any errors that occur during the process
		if (error instanceof AppError) {
			log('warn', `GET ${route}`, error.description)
			return NextResponse.json(
				{ error: error.message },
				{ status: error.statusCode }
			)
		}

		log('error', route, 'Internal Server Error', { error })
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
