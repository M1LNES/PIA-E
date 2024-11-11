import Ably from 'ably'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { log } from '@/app/api/logger'

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
export async function GET() {
	// Retrieve user session
	const session = await getServerSession()
	if (!session) {
		// Log unauthorized access attempt and respond with 401 error
		log('warn', route, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	// Generate Ably token request data for client access
	const tokenRequestData = await client.auth.createTokenRequest({
		clientId: 'ably-nextjs-demo', // Set client ID for Ably connection
	})

	return Response.json(tokenRequestData)
}
