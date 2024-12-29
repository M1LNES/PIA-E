import { NextResponse } from 'next/server'
import { log } from '@/app/api/utils/logger'
import { getAuthors } from '../../service/author-service'
import { Author } from '../../utils/test-interface'

/**
 * GET /api/public/authors
 * Fetches a list of authors and returns it in JSON format.
 *
 * @returns {Promise<NextResponse<Author[]>>} - JSON response containing the list of authors.
 */
export async function GET(): Promise<NextResponse<Author[]>> {
	const authors = await getAuthors()
	// Log the retrieval of authors
	log('info', 'GET api/public/authors', 'Authors fetched and returned')

	// Return the authors as a JSON response
	return NextResponse.json(authors, { status: 200 })
}
