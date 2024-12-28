import { CategoryDomain, CommentDomain } from '@/dto/types'

export type UserWithPermissions = {
	email: string
	role: number
	permission: number
}

/* DTO for returning all categories */
export type DbCategory = {
	id: number
	name: string
}

/**
 * Mapuje databázový objekt kategorie na doménový objekt.
 * @param dbCategory Objekt kategorie z databáze.
 * @returns Doménový objekt kategorie.
 */
function mapDbCategoryToDomain(dbCategory: DbCategory): CategoryDomain {
	return {
		categoryId: dbCategory.id,
		categoryName: dbCategory.name,
	}
}

export function mapDbCategoriesToDomain(
	dbCategories: DbCategory[]
): CategoryDomain[] {
	return dbCategories.map(mapDbCategoryToDomain)
}

/* DTO for returning comment */

export type Comment = {
	id: number
	author: string
	post: number
	description: string
	created_at: string
	username: string
}

function mapDbCommentToDomain(dbComment: Comment): CommentDomain {
	return {
		commentId: dbComment.id,
		authorId: dbComment.author,
		postId: dbComment.post,
		content: dbComment.description,
		createdAt: dbComment.created_at,
		username: dbComment.username,
	}
}

export function mapDbCommentsToDomain(dbComments: Comment[]): CommentDomain[] {
	return dbComments.map(mapDbCommentToDomain)
}
