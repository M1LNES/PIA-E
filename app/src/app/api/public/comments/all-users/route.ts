import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export const revalidate = 1
export const fetchCache = 'force-no-store'

export async function GET() {
	try {
		const { rows } =
			await sql`SELECT COUNT(*) AS total_comments FROM ThreadComments`
		const totalComments = rows[0].total_comments

		return NextResponse.json({ totalComments: totalComments }, { status: 200 })
	} catch (error) {
		return NextResponse.json(
			{ error: 'An error occurred while fetching the total comments.' },
			{ status: 500 }
		)
	}
}
