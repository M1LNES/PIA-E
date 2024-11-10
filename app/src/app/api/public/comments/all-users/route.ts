import { NextResponse } from 'next/server'
import { getTotalComments } from '@/app/api/queries' // Adjust the import path as necessary
import { log } from '@/app/api/logger'

export const revalidate = 1
export const fetchCache = 'force-no-store'

const route = 'GET /api/public/comments/all-users'

export async function GET() {
	log('debug', route, 'Fetching total comments...')

	try {
		const totalComments = await getTotalComments()
		log('info', route, 'All categories successfully fetched', { totalComments })
		return NextResponse.json({ totalComments }, { status: 200 })
	} catch (error) {
		log('error', route, 'Failed to fetch total comments', {
			error: (error as Error).message,
		})

		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
