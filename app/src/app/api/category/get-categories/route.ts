import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function GET() {
	try {
		const result = await sql`SELECT * FROM Category;`
		const categories = result.rows
		return NextResponse.json({ categories }, { status: 200 })
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 })
	}
}
