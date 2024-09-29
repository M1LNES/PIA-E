import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	const body = await request.json()
	const { title, description, category } = body
	if (!title || !description || !category) {
		return NextResponse.json({
			received: true,
			status: 400,
			message: 'All fields are required',
		})
	}

	try {
		await sql`
		    INSERT INTO posts (title, description, category, author)
		    VALUES (${title}, ${description}, ${category}, 1) RETURNING *;
		  `
		return NextResponse.json({
			received: true,
			status: 200,
			message: 'Post created',
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
