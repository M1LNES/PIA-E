import { CommentDomain } from '@/dto/types'
import { Comment, mapDbCommentsToDomain } from '../utils/dtos'
import { AppError } from '../utils/errors'
import {
	getCommentsByPost,
	getCommentsByPostId,
	getTotalComments,
	getUserDetailsById,
	getUserIdByEmail,
	getUserWithPermissions,
	insertComment,
} from '../utils/queries'
import { validateSession } from './session-service'
import config from '@/app/config'

export async function createNewComment(postId: string, description: string) {
	// Retrieve user session
	const session = await validateSession()

	// Retrieve user ID based on session email
	const userId = await getUserIdByEmail(session?.user?.email as string)
	if (!userId) {
		throw new AppError(
			'Not enough permissions!',
			403,
			`User ${session.user?.email} was not found in DB! Most likely they are deactivated.`
		)
	}

	/* Authorization */
	// Check if user has sufficient permissions to add comments
	const user = await getUserDetailsById(userId)
	if (user.permission < config.pages.createPost.minPermission) {
		throw new AppError(
			'Not enough permissions!',
			403,
			`User ${session.user?.email} tried to add comment, but did not have enough permissions!`
		)
	}

	if (!description || !postId) {
		throw new AppError(
			'Missing required fields',
			400,
			`User ${session.user?.email} did not specify description or postId:`
		)
	}

	// Insert new comment into the database
	const comment = await insertComment(userId, postId, description)

	// Clear the created_at timestamp before returning response
	comment.created_at = null

	return comment
}

export async function getPostCommentById(
	postId: number
): Promise<CommentDomain[]> {
	const session = await validateSession()

	if (!postId) {
		throw new AppError(
			'Post Id not specified',
			400,
			`User ${session.user?.email} did not specify postId`
		)
	}

	/* Authorization */

	// Retrieve user with permission level and check if sufficient for access
	const user = await getUserWithPermissions(session.user?.email as string)
	if (user.permission < config.pages.home.minPermission) {
		throw new AppError(
			'Not enough permissions!',
			403,
			`User ${session.user?.email} does not have permission to access this route!`
		)
	}

	// Fetch and return comments for the specified post ID
	const comments = <Comment[]>await getCommentsByPostId(postId)

	return await mapDbCommentsToDomain(comments)
}

export async function getTotalCommentsPublic(): Promise<number> {
	return await getTotalComments()
}

export async function getCommentsForUser(email: string) {
	// If no email is provided, return a 400 Bad Request response
	if (!email) {
		throw new AppError('Email is required', 400, `Email required`)
	}

	// Fetch comments grouped by post ID for the provided email
	const commentsByPostRows = await getCommentsByPost(email)

	// Transform the result into an object where each key is a "postX" (post ID) and the value is the comment count
	const commentsByPost = commentsByPostRows.reduce(
		(acc: Record<string, number>, row) => {
			// Format the key as "postX"
			acc[`post${row.post}`] = row.comment_count
			return acc
		},
		{}
	)

	return commentsByPost
}
