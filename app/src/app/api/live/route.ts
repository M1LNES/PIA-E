import Ably from 'ably'
import { NextResponse } from 'next/server'
import { log } from '@/app/api/utils/logger'
import { validateSession } from '../service/session-service'
import { AppError } from '../utils/errors'

export const revalidate = 0
export const fetchCache = 'force-no-store'

// Initialize Ably client with API key
const client = new Ably.Rest(process.env.ABLY_API_KEY as string)

const route = 'GET /api/live'

/**
 * Generates an Ably token request for authenticated users.
 * This route ensures that only users with a valid session can receive an Ably token,
 * which is required for accessing Ably channels securely on the client-side.
 *
 * @returns {Response} - JSON response with Ably token request data or error details.
 */
export async function GET(): Promise<NextResponse | Response> {
	try {
		await validateSession()
		// Generate Ably token request data for client access
		const tokenRequestData = await client.auth.createTokenRequest({
			clientId: 'ably-nextjs-demo', // Set client ID for Ably connection
		})
		return Response.json(tokenRequestData)
	} catch (error) {
		// Log any errors that occur during the process
		if (error instanceof AppError) {
			log('warn', `POST ${route}`, error.description)
			return NextResponse.json(
				{ error: error.message },
				{ status: error.statusCode }
			)
		}

		// Log internal server error details and respond with 500 error
		log('error', route, 'Error occurred during adding new comment', {
			error: (error as Error).message,
		})

		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
