import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export const revalidate = 1
export const fetchCache = 'force-no-store'

export async function GET() {
	try {
		const result = await sql`SELECT * FROM Category;`

		return NextResponse.json(result.rows, { status: 200 })
	} catch (error) {
		return NextResponse.json(
			{ error: 'An error occurred while fetching categories.' },
			{ status: 500 }
		)
	}
}
