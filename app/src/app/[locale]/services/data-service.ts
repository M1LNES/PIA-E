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

export const activateUser = async (email: string) => {
	const response = await fetch('/api/users/activate-user', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ email }),
	})

	if (!response.ok) {
		throw new Error('Failed to fetch data')
	}

	const result = await response.json()
	return result
}

export const disableUser = async (email: string) => {
	const response = await fetch('/api/users/disable-user', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ email }),
	})

	if (!response.ok) {
		throw new Error('Failed to disable user')
	}

	const result = await response.json()
	return result
}

export const createNewUser = async (postData: {
	username: string
	email: string
	selectedRole: number
	password: string
	confirmPassword: string
}) => {
	const response = await fetch('/api/users/add-user', {
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

export const createCategory = async (title: string) => {
	const response = await fetch('/api/category/add-category', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ title }),
	})

	if (!response.ok) {
		throw new Error('Failed to create category')
	}

	const result = await response.json()
	return result
}

export const addPost = async (postData: {
	title: string
	description: string
	category: number
}) => {
	const response = await fetch('/api/posts/add-post', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(postData),
	})

	if (!response.ok) {
		throw new Error('Failed to add post')
	}

	const result = await response.json()
	return result
}
