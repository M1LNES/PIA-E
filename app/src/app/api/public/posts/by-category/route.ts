import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export const revalidate = 1
export const fetchCache = 'force-no-store'

type CategoryPostCountRow = {
	category_name: string
	post_count: string
}

export async function GET() {
	try {
		// Fetch the number of posts for each category
		const result = await sql`
		SELECT c.name AS category_name, COUNT(p.id) AS post_count
		FROM Category c
		LEFT JOIN Posts p ON c.id = p.category
		GROUP BY c.id;
		`

		// Transform the result into the desired format
		const rows = result.rows as CategoryPostCountRow[]
		const categoryPostCounts = rows.reduce(
			(acc: Record<string, number>, row) => {
				acc[row.category_name] = parseInt(row.post_count, 10)
				return acc
			},
			{}
		)

		// Return the counts as a JSON response
		return NextResponse.json(categoryPostCounts, { status: 200 })
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 })
	}
}
