import { sql } from '@vercel/postgres'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	const body = await request.json()
	const { title } = body

	const session = await getServerSession()
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	if (!title) {
		return NextResponse.json({
			received: true,
			status: 400,
			message: 'Title field required',
		})
	}

	try {
		const duplicate = await sql`
		    SELECT * FROM Category WHERE name=${title};
		  `
		const result = duplicate.rows

		if (result.length > 0) {
			return NextResponse.json({
				received: true,
				status: 409,
				message: 'Category with this title already exists!',
			})
		}

		await sql`
		    INSERT INTO Category (name)
		    VALUES (${title}) RETURNING *;
		  `
		return NextResponse.json({
			received: true,
			status: 200,
			message: 'Category created',
		})
	} catch (error) {
		console.error('Database error:', error)
		return NextResponse.json({
			received: true,
			status: 500,
			message: 'Inernal server error',
		})
	}
}
