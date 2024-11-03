import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import appConfig from './app/config'
import { getUserWithPermissions } from '@/app/api/queries'

const secret = process.env.NEXTAUTH_SECRET
const intlMiddleware = createMiddleware(routing)

// Defining the type of page keys in appConfig
type PageKey = keyof typeof appConfig.pages

// Defining the urlMatcher with type
const urlMatcher: Record<string, PageKey> = {
	'/home': 'home',
	'/my-account': 'myAccount',
	'/create-post': 'createPost',
	'/manage-users': 'manageUsers',
	'/create-category': 'createCategory',
}

export default async function middleware(req: NextRequest) {
	// Step 1: Run the i18n middleware logic but DO NOT return early
	const intlResponse = intlMiddleware(req)

	// Step 2: Check the user's session (JWT)
	const token = await getToken({ req, secret })

	// If no token, allow access (for public pages)
	if (!token) {
		return intlResponse || NextResponse.next()
	}

	// Step 3: Validate session (check if the user is still active)
	const user = await getUserWithPermissions(token.email as string)

	if (!user) {
		// If the user is disabled or not found, redirect to login and clear the session
		const response = NextResponse.redirect(new URL('/', req.url))
		response.cookies.set('next-auth.session-token', '', {
			expires: new Date(0),
		})
		return response
	}
	// Step 4 - validating url
	const pagePath = req.nextUrl.pathname.replace(/^\/(cs|en)\//, '/')
	const pageConfig = appConfig.pages[urlMatcher[pagePath]]

	if (pageConfig && user.permission < pageConfig.minPermission) {
		return NextResponse.json(
			{ error: 'Not enough permissions to access this page' },
			{ status: 403 }
		)
	}

	// Step 5: Proceed with the request if the user is allowed
	return intlResponse || NextResponse.next()
}

export const config = {
	matcher: ['/', '/(cs|en)/:path*'], // Match internationalized routes
}
