import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { sql } from '@vercel/postgres'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Secret for JWT (required to validate the session)
const secret = process.env.NEXTAUTH_SECRET

// Create i18n middleware instance
const intlMiddleware = createMiddleware(routing)

export default async function middleware(req: NextRequest) {
	// Step 1: Run the i18n middleware logic but DO NOT return early
	const intlResponse = intlMiddleware(req)

	// Continue to session validation after i18n is processed

	// Step 2: Check the user's session (JWT)
	const token = await getToken({ req, secret })

	// If no token, let the request pass through (for public pages)
	if (!token) {
		return intlResponse || NextResponse.next()
	}

	// Step 3: Validate session (check if the user is still active)
	const result =
		await sql`SELECT * FROM Users WHERE email = ${token.email} AND deleted_at IS NULL;`
	const user = result.rows[0]
	if (!user) {
		// If the user is disabled or not found, redirect to login and clear the session
		const response = NextResponse.redirect(new URL('/', req.url)) // redirecting to main page to login
		response.cookies.set('next-auth.session-token', '', {
			expires: new Date(0),
		}) // Clear session cookie
		return response
	}

	// Step 4: Proceed with the request if the user is active, return i18n response if applicable
	return intlResponse || NextResponse.next()
}

export const config = {
	// Match internationalized routes
	matcher: ['/', '/(cs|en)/:path*'],
}
