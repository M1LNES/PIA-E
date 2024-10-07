export const fetchAllCategories = async (setCategory: (id: number) => void) => {
	const response = await fetch('/api/category/get-categories')
	if (!response.ok) {
		throw new Error('Failed to fetch data')
	}

	const result = (await response.json()).categories
	setCategory(result[0].id || 0) // setting first category as a default value in select box
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

export const fetchAllRoles = async (setSelectedRole: (id: number) => void) => {
	const response = await fetch('/api/roles/get-roles')
	if (!response.ok) {
		throw new Error('Failed to fetch data')
	}

	const result = (await response.json()).roles
	setSelectedRole(result[0].id || 0)
	return result
}
