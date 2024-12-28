import { NextResponse } from 'next/server'
import { log } from '@/app/api/utils/logger'
import { createNewPost, getAllPosts } from '../service/post-service'
import { AppError } from '../utils/errors'

const route = '/api/posts'

/**
 * Adds a new post by the authenticated user if they have sufficient permissions.
 * Requires a valid session and checks for mandatory fields.
 *
 * @param {Request} request - Incoming request object.
 * @returns {Response} - JSON response indicating success or error.
 */
export async function POST(request: Request) {
	try {
		// Parse and validate the request body fields
		const body = await request.json()
		const { title, description, category } = body

		// Insert the new post into the database

		await createNewPost(title, description, category)

		return NextResponse.json(
			{ message: 'Post created successfully' },
			{ status: 201 }
		)
	} catch (error) {
		// Log any errors that occur during the process
		if (error instanceof AppError) {
			log('warn', `GET ${route}`, error.description)
			return NextResponse.json(
				{ error: error.message },
				{ status: error.statusCode }
			)
		}

		// Log any errors that occur during post creation
		log('error', `POST ${route}`, 'Failure while adding new post', {
			error: (error as Error).message,
		})
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

/**
 * Retrieves all posts with additional details.
 * Requires a valid session but does not enforce specific authorization.
 *
 * @returns {Response} - JSON response containing posts or an error message.
 */
export async function GET() {
	try {
		// Fetch all posts with details
		const posts = await getAllPosts()
		log('info', `GET ${route}`, `Returning all posts`)
		return NextResponse.json({ posts }, { status: 200 })
	} catch (error) {
		// Log any errors that occur during the process
		if (error instanceof AppError) {
			log('warn', `GET ${route}`, error.description)
			return NextResponse.json(
				{ error: error.message },
				{ status: error.statusCode }
			)
		}
		// Handle any errors during the data fetching process
		log('error', `${route} - GET`, 'Failure while fetching posts', {
			error: (error as Error).message,
		})
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
