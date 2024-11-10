import { NextResponse } from 'next/server'
import { getAllCategories } from '@/app/api/queries'
import { log } from '@/app/api/logger'

export const revalidate = 1
export const fetchCache = 'force-no-store'

const route = 'GET /api/public/categories'

export async function GET() {
	log('debug', route, 'Fetching all categories...')
	try {
		const result = await getAllCategories()

		log('info', route, 'All categories successfully fetched', { result })

		return NextResponse.json(result, { status: 200 })
	} catch (error) {
		log('error', route, 'Failed to fetch categories', {
			error: (error as Error).message,
		})

		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
