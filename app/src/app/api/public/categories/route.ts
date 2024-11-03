import { NextResponse } from 'next/server'
import { getAllCategories } from '@/app/api/queries'

export const revalidate = 1
export const fetchCache = 'force-no-store'

export async function GET() {
	try {
		const result = await getAllCategories()
		return NextResponse.json(result, { status: 200 })
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 })
	}
}
