import { NextResponse } from 'next/server'
import { log } from '@/app/api/utils/logger'
import { getRolesForUser } from '../service/roles-service'
import { AppError } from '../utils/errors'

/**
 * API Route: GET /api/roles
 *
 * This route retrieves all available roles if the user is authenticated and authorized.
 * The route first checks if the user is authenticated, and then checks if they have the required permissions
 * to access the roles. If successful, it returns a list of roles; otherwise, it returns an error.
 */
export const revalidate = 1 // Cache revalidation time in seconds
export const fetchCache = 'force-no-store' // Disables caching for this request

const route = 'GET /api/roles'

/**
 * Handles the GET request to fetch available roles for a user.
 *
 * @returns {NextResponse} - A response containing roles data or an error message.
 */
export async function GET() {
	try {
		const roles = await getRolesForUser()

		log('info', route, `Returning roles`)
		return NextResponse.json({ roles }, { status: 200 })
	} catch (error) {
		if (error instanceof AppError) {
			log('warn', route, error.description)
			return NextResponse.json(
				{ error: error.message },
				{ status: error.statusCode }
			)
		}

		log('error', route, 'Internal Server Error', { error })
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
