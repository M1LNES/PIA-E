import { NextResponse } from 'next/server'
import { getRoleUserCounts } from '@/app/api/queries'
import { log } from '@/app/api/logger'

export const revalidate = 1
export const fetchCache = 'force-no-store'
const route = 'GET /api/public/users/by-category'

export async function GET() {
	log('debug', route, 'Fetching users by role')

	try {
		const roleUserCounts = await getRoleUserCounts()

		// Return the counts as a JSON response
		log(
			'info',
			route,
			'Roles for each user successfully fetched',
			roleUserCounts
		)

		return NextResponse.json(roleUserCounts, { status: 200 })
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
