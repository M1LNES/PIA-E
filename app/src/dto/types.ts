/* Category object */
export type CategoryDomain = {
	categoryId: number
	categoryName: string
}

/* Comment object */
export type CommentDomain = {
	commentId: number
	authorId: string
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
