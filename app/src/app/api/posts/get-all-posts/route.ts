import { sql } from '@vercel/postgres'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export const revalidate = 1
export const fetchCache = 'force-no-store'

export async function GET() {
	const session = await getServerSession()
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	/* Authorization */

	// Posts are visible to anyone, no autorization needed

	try {
		const result = await sql`
		SELECT 
			Users.username, 
			Roles.type AS role_type, 
			Posts.id AS post_id,
			Posts.title,
			Posts.description,
			Posts.created_at,	
			Posts.edited_at,
			Category.name AS category_name,
			COUNT(ThreadComments.id) AS comment_count  -- Counts non-deleted comments for each post
		FROM 
			Users
		JOIN 
			Posts ON Posts.author = Users.id 
		JOIN 
			Roles ON Users.role = Roles.id  
		JOIN 
			Category ON Posts.category = Category.id 
		LEFT JOIN 
			ThreadComments ON ThreadComments.post = Posts.id 
			AND ThreadComments.deleted_at IS NULL  -- Filters out deleted comments
		WHERE 
			Posts.deleted_at IS NULL 
		GROUP BY 
			Users.username, Roles.type, Posts.id, Posts.title, Posts.description, 
			Posts.created_at, Posts.edited_at, Category.name
		ORDER BY 
			Posts.created_at;
		`
		const posts = result.rows
		return NextResponse.json({ posts }, { status: 200 })
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 })
	}
}
