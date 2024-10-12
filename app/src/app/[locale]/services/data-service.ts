export const fetchAllCategories = async () => {
	const response = await fetch('/api/category/get-categories')
	if (!response.ok) {
		throw new Error('Failed to fetch data')
	}

	const result = (await response.json()).categories
	return result
}

export const fetchAllCreatedCategories = async () => {
	const response = await fetch('/api/category/get-categories')
	if (!response.ok) {
		throw new Error('Failed to fetch data')
	}

	const result = (await response.json()).categories
	return result
}

export const fetchAllPosts = async () => {
	const response = await fetch('/api/posts/get-all-posts')
	if (!response.ok) {
		throw new Error('Failed to fetch data')
	}

	const result = (await response.json()).posts
	return result
}

export const fetchAllUsers = async () => {
	const response = await fetch('/api/users/get-all-users')
	if (!response.ok) {
		throw new Error('Failed to fetch data')
	}

	const result = (await response.json()).users
	return result
}

export const fetchAllRoles = async () => {
	const response = await fetch('/api/roles/get-roles')
	if (!response.ok) {
		throw new Error('Failed to fetch data')
	}

	const result = (await response.json()).roles
	return result
}

export const changeUserRole = async (userId: number, roleId: number) => {
	const response = await fetch('/api/users/change-role', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ userId, roleId }),
	})

	if (!response.ok) {
		throw new Error('Failed to fetch data')
	}

	const result = await response.json()
	return result
}
