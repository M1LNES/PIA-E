import { NextResponse } from 'next/server'
import { getTotalComments } from '@/app/api/queries' // Adjust the import path as necessary

export const revalidate = 1
export const fetchCache = 'force-no-store'

export async function GET() {
	try {
		const totalComments = await getTotalComments()

		return NextResponse.json({ totalComments }, { status: 200 })
	} catch {
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
