import {
	CategoryDomain,
	CommentDomain,
	PostWithDetailsDomain,
	RoleDomain,
	UserDomain,
	UserSelfInfoDomain,
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
 * @param dbCategory Object DbCategory from DB.
 * @returns Domen object CategoryDomain
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
	post: number
	description: string
	created_at: string
	username: string
}

export function mapDbCommentToDomain(dbComment: Comment): CommentDomain {
	return {
		commentId: dbComment.id,
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
 * @param dbPosts - Array of DbPostWithDetails from DB.
 * @returns Array of PostWithDetailsDomain.
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

/* User object */
export type User = {
	id: number
	username: string
	email: string
	deleted_at: string | null
	roleid: number
}

/**
 * Maps a User (database result) to a UserDomain (application domain).
 * @param user The user object from the database query.
 * @returns The mapped UserDomain object.
 */
function mapUserToDomain(user: User): UserDomain {
	return {
		userId: user.id,
		username: user.username,
		userEmail: user.email,
		deletedTime: user.deleted_at, // If deleted_at is not null, the user is considered deleted
		roleId: user.roleid,
	}
}

/**
 * Maps an array of Users (database result) to an array of UserDomains.
 * @param users An array of user objects from the database query.
 * @returns An array of mapped UserDomain objects.
 */
export function mapUsersToDomains(users: User[]): UserDomain[] {
	return users.map(mapUserToDomain)
}

/* User self info */
export type UserSelfInfo = {
	id: number
	username: string
	email: string
	role: number
	type: string
	permission: number
}

/**
 * Maps a UserSelfInfo (database result) to a UserSelfInfoDomain (application domain).
 * @param user The user object from the database query.
 * @returns The mapped UserSelfInfoDomain object.
 */
export function mapUserSelfInfoToDomain(
	user: UserSelfInfo
): UserSelfInfoDomain {
	return {
		userId: user.id,
		username: user.username,
		userEmail: user.email,
		roleId: user.role,
		roleType: user.type,
		rolePermission: user.permission,
	}
}

export type TotalCommentsResponse = {
	totalComments: number
}

export type DbPost = {
	id: number
	title: string
	author: number
	category: number
	description: string
	created_at: string
	edited_at: string | null
	deleted_at: string | null
}

export type UserDeleted = {
	id: number
	username: string
	email: string
	role: number
	type: string
	permission: number
}

export type UserDb = {
	id: number
	username: string
	role: number
	created_at: string
	email: string
	hashed_password: string
	deleted_at: string | null
}
