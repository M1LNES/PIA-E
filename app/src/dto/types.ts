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
