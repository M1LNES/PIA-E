/* Category object */
export type CategoryDomain = {
	categoryId: number
	categoryName: string
}

/* Comment object */
export type CommentDomain = {
	commentId: number
	postId: number
	content: string
	createdAt: string
	username: string
}

/* Post object */

export type PostWithDetailsDomain = {
	postId: number
	title: string
	description: string
	createdAt: string
	editedAt: string | null
	username: string
	roleType: string
	categoryName: string
	commentCount: number
}

/* Role object */

export type RoleDomain = {
	roleId: number
	roleType: string
	rolePermission: number
}

/* User object */

export type UserDomain = {
	userId: number
	username: string
	userEmail: string
	deletedTime: string | null
	roleId: number
}

/* User self info object */
export type UserSelfInfoDomain = {
	userId: number
	username: string
	userEmail: string
	roleId: number
	roleType: string
	rolePermission: number
}

export type AllCategories = { categories: CategoryDomain[] }
export type AllPosts = { posts: PostWithDetailsDomain[] }
export type AllUsers = { users: UserDomain[] }
export type AllRoles = { roles: RoleDomain[] }
export type UserSelf = { user: UserSelfInfoDomain }
export type RoleChanged = { message: string }
export type UserActivated = { message: string }
export type UserDeactivated = { message: string }
export type UserCreated = { message: string }
export type CategoryCreated = { message: string }
export type PostCreated = { message: string }
export type PasswordChanged = { message: string }
export type PostComments = CommentDomain[]
export type CommentCreated = {
	message: string
	comment: CommentDomain
}

/* Error response */
export type ErrorResponse = {
	error: string
}
