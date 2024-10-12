import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export const revalidate = 1
export const fetchCache = 'force-no-store'

export async function GET() {
	try {
		const result = await sql`SELECT 
		Users.username, 
		Roles.type AS role_type, 
		Posts.id AS post_id,
		Posts.title,
		Posts.description,
		Posts.created_at,	
		Posts.edited_at,
		Category.name AS category_name 
		FROM Users
		JOIN Posts ON Posts.author = Users.id 
		JOIN Roles ON Users.role = Roles.id  
		JOIN Category ON Posts.category = Category.id 
		WHERE Posts.deleted_at IS NULL 
		ORDER BY created_at; 
		`
		const posts = result.rows
		return NextResponse.json({ posts }, { status: 200 })
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 })
	}
}
