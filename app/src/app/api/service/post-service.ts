import { PostWithDetailsDomain } from '@/dto/types'
import { mapDbPostsToDTO } from '../utils/dtos'
import { AppError } from '../utils/errors'
import {
	getCategoryPostCounts,
	getPostsWithDetails,
	getUserDetailsById,
	getUserIdByEmail,
	insertPost,
} from '../utils/queries'
import { validateSession } from './session-service'
import config from '@/app/config'

export async function getAllPosts(): Promise<PostWithDetailsDomain[]> {
	await validateSession()
	// Posts are accessible to any authenticated user, no further authorization needed

	const posts = await getPostsWithDetails()

	const dtoPosts = <PostWithDetailsDomain[]>await mapDbPostsToDTO(posts)
	return dtoPosts
}

export async function createNewPost(
	title: string,
	description: string,
	category: number
) {
	const session = await validateSession()

	const userId = await getUserIdByEmail(session?.user?.email as string)
	if (!userId) {
		throw new AppError(
			'Not enough permissions!',
			403,
			`User ${session.user?.email} was not found in DB! Most likely they are deactivated.`
		)
	}

	/* Authorization */

	// Verify if user has the required permission level to add a post
	const user = await getUserDetailsById(userId)
	if (user.permission < config.pages.createPost.minPermission) {
		throw new AppError(
			'Not enough permissions!',
			403,
			`User ${session.user?.email} tried to add posts but lacked permission.`
		)
	}

	if (!title || !description || category == -1) {
		throw new AppError(
			'All fields are required',
			400,
			`User ${session.user?.email} did not specify all required fields.`
		)
	}

	await insertPost(title, description, category, userId)
}

export async function getCategoryPostCountsPublic() {
	return await getCategoryPostCounts()
}
