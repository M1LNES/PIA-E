import { NextResponse } from 'next/server'

/**
 * API route handler that provides information about the API endpoints.
 *
 * This function returns a message and a URL where users can find a list of all the supported endpoints
 * by this API.
 *
 * @returns A JSON response containing a message and a URL to the API documentation.
 */
export async function GET() {
	return NextResponse.json(
		{
			message:
				'All endpoints that are supported by this API can be found in the following URL',
			url: 'https://pia-e-docs.vercel.app/api/about', // URL to the API documentation
		},
		{ status: 200 } // Success response status
	)
}
