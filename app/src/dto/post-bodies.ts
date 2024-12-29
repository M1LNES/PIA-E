/* POST /api/categories */
export type CreateCategoryRequest = {
	categoryTitle: string
}

/* POST /api/comments */
export type CreateCommentRequest = {
	content: string
	postId: number
}

/* POST /api/posts */
export type CreatePostRequest = {
	postTitle: string
	postDescription: string
	postCategory: number
}

/* POST /api/public/comments */
/* POST /api/users/activation */
/* POST /api/users/deactivation */
/* POST /api/users/self */
export type InputEmailAddress = {
	emailAddress: string
}

/* POST /api/users/password */
export type ChangePasswordRequest = {
	emailAddress: string
	oldPassword: string
	newPassword: string
	newPasswordConfirm: string
}

/* POST /api/users/role */
export type ChangeRoleRequest = {
	userId: number
	roleId: number
}

/* POST /api/users */
export type CreateUserRequest = {
	username: string
	emailAddress: string
	selectedRole: number
	password: string
	confirmPassword: string
}
