import {
	ChangePasswordRequest,
	ChangeRoleRequest,
	CreateCategoryRequest,
	CreateCommentRequest,
	CreatePostRequest,
	CreateUserRequest,
	InputEmailAddress,
} from '@/dto/post-bodies'

/**
 * Fetches all categories from the API.
 * @returns {Promise<Array>} A promise that resolves to an array of categories.
 * @throws {Error} If the request fails or the response is not ok.
 */
export const fetchAllCategories = async () => {
	const response = await fetch('/api/categories')
	if (!response.ok) {
		throw new Error('Failed to fetch categories')
	}

	const result = (await response.json()).categories
	return result
}

/**
 * Fetches all posts from the API.
 * @returns {Promise<Array>} A promise that resolves to an array of posts.
 * @throws {Error} If the request fails or the response is not ok.
 */
export const fetchAllPosts = async () => {
	const response = await fetch('/api/posts')
	if (!response.ok) {
		throw new Error('Failed to fetch posts')
	}

	const result = (await response.json()).posts
	return result
}

/**
 * Fetches all users from the API.
 * @returns {Promise<Array>} A promise that resolves to an array of users.
 * @throws {Error} If the request fails or the response is not ok.
 */
export const fetchAllUsers = async () => {
	const response = await fetch('/api/users')
	if (!response.ok) {
		throw new Error('Failed to fetch users data')
	}

	const result = (await response.json()).users
	return result
}

/**
 * Fetches all roles from the API.
 * @returns {Promise<Array>} A promise that resolves to an array of roles.
 * @throws {Error} If the request fails or the response is not ok.
 */
export const fetchAllRoles = async () => {
	const response = await fetch('/api/roles')
	if (!response.ok) {
		throw new Error('Failed to fetch roles')
	}

	const result = (await response.json()).roles
	return result
}

/**
 * Changes the role of a user.
 * @param {number} userId - The ID of the user to change the role for.
 * @param {number} roleId - The new role ID to assign to the user.
 * @returns {Promise<Object>} A promise that resolves to the result of the role change.
 * @throws {Error} If the request fails or the response is not ok.
 */
export const changeUserRole = async (userId: number, roleId: number) => {
	const reqBody: ChangeRoleRequest = { userId, roleId }
	const response = await fetch('/api/users/role', {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(reqBody),
	})

	if (!response.ok) {
		throw new Error('Failed to change role')
	}

	const result = await response.json()
	return result
}

/**
 * Activates a user based on their email address.
 * @param {string} email - The email address of the user to activate.
 * @returns {Promise<Object>} A promise that resolves to the result of the activation.
 * @throws {Error} If the request fails or the response is not ok.
 */
export const activateUser = async (email: string) => {
	const reqBody: InputEmailAddress = { emailAddress: email }
	const response = await fetch('/api/users/activation', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(reqBody),
	})

	if (!response.ok) {
		throw new Error('Failed to activate user')
	}

	const result = await response.json()
	return result
}

/**
 * Disables a user based on their email address.
 * @param {string} email - The email address of the user to disable.
 * @returns {Promise<Object>} A promise that resolves to the result of the disabling.
 * @throws {Error} If the request fails or the response is not ok.
 */
export const disableUser = async (email: string) => {
	const reqBody: InputEmailAddress = { emailAddress: email }
	const response = await fetch('/api/users/deactivation', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(reqBody),
	})

	if (!response.ok) {
		throw new Error('Failed to disable user')
	}

	const result = await response.json()
	return result
}

/**
 * Creates a new user with the provided data.
 * @param {Object} postData - The data for the new user.
 * @param {string} postData.username - The username of the new user.
 * @param {string} postData.emailAddress - The email address of the new user.
 * @param {number} postData.selectedRole - The ID of the role to assign to the user.
 * @param {string} postData.password - The password for the new user.
 * @param {string} postData.confirmPassword - The password confirmation.
 * @returns {Promise<Object>} A promise that resolves to the result of the user creation.
 * @throws {Error} If the request fails or the response is not ok.
 */
export const createNewUser = async (postData: CreateUserRequest) => {
	const response = await fetch('/api/users', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(postData),
	})

	if (!response.ok) {
		throw new Error('Failed to create new user')
	}

	const result = await response.json()
	return result
}

/**
 * Creates a new category with the provided title.
 * @param {string} title - The title of the new category.
 * @returns {Promise<Object>} A promise that resolves to the result of the category creation.
 * @throws {Error} If the request fails or the response is not ok.
 */
export const createCategory = async (title: string) => {
	const reqBody: CreateCategoryRequest = { categoryTitle: title }
	const response = await fetch('/api/categories', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(reqBody),
	})

	if (!response.ok) {
		throw new Error('Failed to create category')
	}

	const result = await response.json()
	return result
}

/**
 * Adds a new post with the provided data.
 * @param {Object} postData - The data for the new post.
 * @param {string} postData.title - The title of the new post.
 * @param {string} postData.description - The description of the new post.
 * @param {number} postData.category - The ID of the category for the new post.
 * @returns {Promise<Object>} A promise that resolves to the result of the post addition.
 * @throws {Error} If the request fails or the response is not ok.
 */
export const addPost = async (postData: {
	title: string
	description: string
	category: number
}) => {
	const bodyReq: CreatePostRequest = {
		postTitle: postData.title,
		postDescription: postData.description,
		postCategory: postData.category,
	}
	const response = await fetch('/api/posts', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(bodyReq),
	})

	if (!response.ok) {
		throw new Error('Failed to add post')
	}

	const result = await response.json()
	return result
}

/**
 * Fetches user data based on the user's email address.
 * @param {string} email - The email address of the user to fetch data for.
 * @returns {Promise<Object>} A promise that resolves to the user's data.
 * @throws {Error} If the request fails or the response is not ok.
 */
export const fetchUserData = async (email: string) => {
	const reqBody: InputEmailAddress = { emailAddress: email }
	const response = await fetch('/api/users/self', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(reqBody),
	})

	if (!response.ok) {
		throw new Error('Failed to fetch userData')
	}

	const result = await response.json()
	return result.user
}

/**
 * Changes the password for a user.
 * @param {Object} postData - The data for changing the password.
 * @param {string} postData.emailAddress - The email address of the user whose password is changing.
 * @param {string} postData.oldPassword - The old password of the user.
 * @param {string} postData.newPassword - The new password to set.
 * @param {string} postData.newPasswordConfirm - Confirmation of the new password.
 * @returns {Promise<Object>} A promise that resolves to the result of the password change.
 * @throws {Error} If the request fails or the response is not ok.
 */
export const changePassword = async (postData: ChangePasswordRequest) => {
	const response = await fetch('/api/users/password', {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(postData),
	})

	if (!response.ok) {
		throw new Error('Failed to change password')
	}

	const result = await response.json()
	return result
}

/**
 * Fetches comments for a specific post based on the post ID.
 * @param {number} postId - The ID of the post to fetch comments for.
 * @returns {Promise<Array>} A promise that resolves to an array of comments for the specified post.
 * @throws {Error} If the request fails or the response is not ok.
 */
export const fetchCommentsByPostId = async (postId: number) => {
	const response = await fetch(`/api/comments/${postId}`)

	if (!response.ok) {
		throw new Error('Failed to fetch comments')
	}

	const result = await response.json()
	return result
}

/**
 * Adds a new comment to a specific post.
 *
 * This function sends a POST request to the server to add a comment to a post.
 * It expects the post data to include the comment's description and the ID of the post.
 *
 * @param {Object} postData - The data for the new comment.
 * @param {string} postData.content - The content of the comment being added.
 * @param {number} postData.postId - The ID of the post to which the comment is being added.
 *
 * @returns {Promise<Object>} A promise that resolves with the result of the comment addition.
 *
 * @throws {Error} If the request fails or the server responds with an error.
 */
export const addComment = async (postData: CreateCommentRequest) => {
	const response = await fetch('/api/comments', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(postData),
	})

	if (!response.ok) {
		throw new Error('Failed to add comment')
	}

	const result = await response.json()
	return result
}
