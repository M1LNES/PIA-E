import { NextResponse } from 'next/server'
import { getCategoryPostCounts } from '@/app/api/queries'
import { log } from '@/app/api/logger'

export const revalidate = 1
export const fetchCache = 'force-no-store'

const route = 'GET /api/public/posts/by-category'

export async function GET() {
	try {
		const categoryPostCounts = await getCategoryPostCounts()
		log('info', route, 'Category posts count fetched.', categoryPostCounts)
		// Return the counts as a JSON response
		return NextResponse.json(categoryPostCounts, { status: 200 })
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
