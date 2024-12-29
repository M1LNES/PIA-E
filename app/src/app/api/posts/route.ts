import { NextResponse } from 'next/server'
import { log } from '@/app/api/utils/logger'
import { createNewPost, getAllPosts } from '../service/post-service'
import { AppError } from '../utils/errors'
import { AllPosts, ErrorResponse, PostCreated } from '@/dto/types'
import { CreatePostRequest } from '@/dto/post-bodies'

const route = '/api/posts'

/**
 * Adds a new post by the authenticated user if they have sufficient permissions.
 * Requires a valid session and checks for mandatory fields.
 *
 * @param {Request} request - Incoming request object.
 * @returns {Promise<NextResponse<ErrorResponse | PostCreated>>} - JSON response indicating success or error.
 */
export async function POST(
	request: Request
): Promise<NextResponse<ErrorResponse | PostCreated>> {
	try {
		// Parse the request body fields
		const body: CreatePostRequest = await request.json()
		const { postTitle, postDescription, postCategory } = body

		// Insert the new post into the database

		await createNewPost(postTitle, postDescription, postCategory)

		return NextResponse.json(
			{ message: 'Post created successfully' },
			{ status: 201 }
		)
	} catch (error) {
		// Log any errors that occur during the process
		if (error instanceof AppError) {
			log('warn', `POST ${route}`, error.description)
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
export async function GET(): Promise<NextResponse<ErrorResponse | AllPosts>> {
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
		log('error', `GET ${route}`, 'Failure while fetching posts', {
			error: (error as Error).message,
		})
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
