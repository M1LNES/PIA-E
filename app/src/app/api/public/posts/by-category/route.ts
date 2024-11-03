import { NextResponse } from 'next/server'
import { getCategoryPostCounts } from '@/app/api/queries'

export const revalidate = 1
export const fetchCache = 'force-no-store'

export async function GET() {
	try {
		const categoryPostCounts = await getCategoryPostCounts()
		// Return the counts as a JSON response
		return NextResponse.json(categoryPostCounts, { status: 200 })
	} catch (error) {
		console.error('Error fetching category post counts:', error)
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
