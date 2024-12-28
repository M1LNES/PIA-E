import {
	CategoryDomain,
	CommentDomain,
	PostWithDetailsDomain,
	RoleDomain,
} from '@/dto/types'

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

/* DTOS for posts */

export type DbPostWithDetails = {
	username: string
	role_type: string
	post_id: number
	title: string
	description: string
	created_at: string
	edited_at: string | null
	category_name: string
	comment_count: number
}

/**
 * Mapuje objekty z databáze na PostWithDetailsDTO.
 * @param dbPosts - Pole objektů z databáze.
 * @returns Pole objektů PostWithDetailsDTO.
 */
export function mapDbPostsToDTO(
	dbPosts: DbPostWithDetails[]
): PostWithDetailsDomain[] {
	return dbPosts.map((post) => ({
		postId: post.post_id,
		title: post.title,
		description: post.description,
		createdAt: post.created_at,
		editedAt: post.edited_at,
		username: post.username,
		roleType: post.role_type,
		categoryName: post.category_name,
		commentCount: post.comment_count,
	}))
}

/* DTOS for Roles */

export type Role = {
	id: number
	type: string
	permission: number
}

/**
 * Maps an array of Role objects to an array of RoleDomain objects.
 * @param roles - The array of Role objects to map.
 * @returns An array of RoleDomain objects.
 */
export function mapRolesToDomain(roles: Role[]): RoleDomain[] {
	return roles.map((role) => ({
		roleId: role.id,
		roleType: role.type,
		rolePermission: role.permission,
	}))
}
