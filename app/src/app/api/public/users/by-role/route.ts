import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export const revalidate = 1
export const fetchCache = 'force-no-store'

export async function GET() {
	try {
		const result = await sql`
        SELECT r.type AS role_type, COUNT(u.id) AS user_count
            FROM Roles r
        LEFT JOIN Users u ON r.id = u.role
            GROUP BY r.id;
        `

		const roleUserCounts = result.rows.reduce(
			(acc: Record<string, number>, row: any) => {
				acc[row.role_type] = parseInt(row.user_count, 10)
				return acc
			},
			{}
		)

		return NextResponse.json(roleUserCounts, { status: 200 })
	} catch (error) {
		console.error(error) // Log the error for debugging
		return NextResponse.json(
			{ error: 'An error occurred while fetching user counts by role.' },
			{ status: 500 }
		)
	}
}
