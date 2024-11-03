import { NextResponse } from 'next/server'
import { getRoleUserCounts } from '@/app/api/queries'

export const revalidate = 1
export const fetchCache = 'force-no-store'

export async function GET() {
	try {
		const roleUserCounts = await getRoleUserCounts()
		// Return the counts as a JSON response
		return NextResponse.json(roleUserCounts, { status: 200 })
	} catch (error) {
		console.error('Error fetching role user counts:', error)
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
