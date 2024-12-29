import { sql } from '@vercel/postgres'
import {
	Comment,
	DbCategory,
	DbPost,
	DbPostWithDetails,
	Role,
	User,
	UserSelfInfo,
	UserWithPermissions,
} from './dtos'

/**
 * Fetches a user by email along with role and permissions.
 * @param email - The email of the user.
 * @returns The user data with role and permissions if found, otherwise undefined.
 */
export async function getUserWithPermissions(
	email: string
): Promise<UserWithPermissions | undefined> {
	const result = await sql`
	  SELECT Users.email, Users.role, Roles.permission 
	  FROM Users 
	  LEFT JOIN Roles ON Users.role = Roles.id 
	  WHERE Users.email = ${email} AND Users.deleted_at IS NULL
	`

	if (result.rows.length === 0) {
		return undefined
	}

	return result.rows[0] as UserWithPermissions
}

/**
 * Fetches a user by their email along with their role and permissions.
 * @param email - The email of the user to fetch.
 * @returns The user data with role and permissions if found, otherwise undefined.
 */
export async function getUserByEmail(email: string): Promise<UserSelfInfo> {
	const result = await sql`
    SELECT Users.id, Users.username, Users.email, Users.role, Roles.type, Roles.permission
    FROM Users
    LEFT JOIN Roles ON Users.role = Roles.id
    WHERE Users.email = ${email} AND Users.deleted_at IS NULL
  `
	return <UserSelfInfo>result.rows[0] // Returns undefined if no user is found
}

/**
 * Checks if a category with the specified title already exists.
 * @param title - The title of the category to check.
 * @returns The existing category if found, otherwise an empty array.
 */
export async function checkDuplicateCategory(
	title: string
): Promise<DbCategory[]> {
	const result = await sql`
    SELECT * FROM Category WHERE name = ${title};
  `
	return result.rows as DbCategory[] // Returns an array of categories found (empty if none)
}

/**
 * Inserts a new category with the specified title into the database.
 * @param title - The title of the category to insert.
 * @returns The newly created category.
 */
export async function createCategory(title: string): Promise<DbCategory> {
	const result = await sql`
	  INSERT INTO Category (name)
	  VALUES (${title}) RETURNING *;
	`
	// Typově kontrolováno: vrátíme první řádek, který obsahuje nově vytvořenou kategorii
	return result.rows[0] as DbCategory
}

// queries.ts

/**
 * Fetches a user by their email if they are not marked as deleted.
 * @param email - The email of the user to fetch.
 * @returns The user data if found, otherwise undefined.
 */
export async function getUserByEmailAndNotDeleted(email: string) {
	const result = await sql`
    SELECT * FROM Users WHERE email = ${email} AND deleted_at IS NULL;
  `
	return result.rows[0] // Returns undefined if no user is found
}

// queries.ts

/**
 * Fetches all users who are not marked as deleted.
 * @returns An array of users from the database.
 */
export async function getAllActiveUsers() {
	const result = await sql`SELECT * FROM Users WHERE deleted_at IS NULL;`
	return result.rows // Returns an array of users
}

/**
 * Fetches all users along with their roles.
 * @returns An array of users with their role information.
 */
export async function getAllUsersWithRoles(): Promise<User[]> {
	const result = await sql`
		SELECT Users.id, Users.username, Users.deleted_at, Users.email, Roles.id as roleid
		FROM Users
		LEFT JOIN Roles ON Users.role = Roles.id;
	`
	return <User[]>result.rows // Returns an array of users with their roles
}

/**
 * Fetches a deleted user by email along with role and permissions.
 * @param email - The email of the user.
 * @returns The user data with role and permissions if found, otherwise undefined.
 */
export async function getDeletedUserByEmail(email: string) {
	const result = await sql`
    SELECT Users.id, Users.username, Users.email, Users.role, Roles.type, Roles.permission 
    FROM Users 
    LEFT JOIN Roles ON Users.role = Roles.id 
    WHERE Users.email = ${email} AND Users.deleted_at IS NOT NULL
  `
	return result.rows[0] // Returns undefined if no user is found
}

/**
 * Updates the deleted_at field of a user to mark them as disabled.
 * @param email - The email of the user to be disabled.
 * @returns A promise that resolves to the result of the update operation.
 */
export async function disableUserByEmail(email: string) {
	const result = await sql`
    UPDATE Users 
    SET deleted_at = NOW() 
    WHERE email = ${email} 
    RETURNING *;
  `
	return result.rows[0] // Returns the updated user data or undefined if no user was found
}

/**
 * Fetches all categories from the database.
 * @returns An array of categories.
 */
export async function getAllCategories(): Promise<DbCategory[]> {
	const result = await sql`SELECT * FROM Category;`
	return result.rows as DbCategory[]
}

/**
 * Fetches all posts with their associated users, roles, categories, and comment counts.
 * @returns An array of posts with details.
 */
export async function getPostsWithDetails(): Promise<DbPostWithDetails[]> {
	const result = await sql`
		SELECT 
			Users.username, 
			Roles.type AS role_type, 
			Posts.id AS post_id,
			Posts.title,
			Posts.description,
			Posts.created_at,	
			Posts.edited_at,
			Category.name AS category_name,
			COUNT(ThreadComments.id) AS comment_count  -- Counts non-deleted comments for each post
		FROM 
			Users
		JOIN 
			Posts ON Posts.author = Users.id 
		JOIN 
			Roles ON Users.role = Roles.id  
		JOIN 
			Category ON Posts.category = Category.id 
		LEFT JOIN 
			ThreadComments ON ThreadComments.post = Posts.id 
			AND ThreadComments.deleted_at IS NULL  -- Filters out deleted comments
		WHERE 
			Posts.deleted_at IS NULL 
		GROUP BY 
			Users.username, Roles.type, Posts.id, Posts.title, Posts.description, 
			Posts.created_at, Posts.edited_at, Category.name
		ORDER BY 
			Posts.created_at;
	`
	return result.rows as DbPostWithDetails[] // Returns an array of posts with details
}

/**
 * Fetches all roles from the Roles table.
 * @returns An array of roles from the database.
 */
export async function getAllRoles(): Promise<Role[]> {
	const result = await sql`SELECT * FROM Roles;`
	return result.rows as Role[] // Returns an array of roles
}

/**
 * Fetches comments for a specific post by post ID.
 * @param postId - The ID of the post for which to fetch comments.
 * @returns An array of comments for the specified post.
 */
export async function getCommentsByPostId(postId: number): Promise<Comment[]> {
	const result = await sql`
		SELECT 
			ThreadComments.id, 
			ThreadComments.post, 
			ThreadComments.description, 
			ThreadComments.created_at, 
			Users.username 
		FROM 
			ThreadComments 
		JOIN 
			Users ON ThreadComments.author = Users.id 
		WHERE 
			post = ${postId} 
		ORDER BY 
			ThreadComments.created_at ASC
	`
	return result.rows as Comment[] // Returns an array of comments
}

/**
 * Fetches a user's ID based on their email.
 * @param email - The email of the user.
 * @returns The user's ID.
 */
export async function getUserIdByEmail(email: string) {
	const result = await sql`
		SELECT id FROM Users 
		WHERE deleted_at IS NULL AND email = ${email}
	`
	if (result.rows.length !== 1) {
		return null // User not found
	}
	return result.rows[0].id // Return user ID
}

/**
 * Fetches user details along with their permissions by user ID.
 * @param userId - The ID of the user.
 * @returns The user's details and permissions.
 */
export async function getUserDetailsById(
	userId: number
): Promise<UserSelfInfo> {
	const result = await sql`
		SELECT 
			Users.id, 
			Users.username, 
			Users.email, 
			Users.role, 
			Roles.type, 
			Roles.permission
		FROM Users
		LEFT JOIN Roles ON Users.role = Roles.id 
		WHERE Users.id = ${userId} AND deleted_at IS NULL
	`
	return result.rows[0] as UserSelfInfo // Return user details
}

/**
 * Inserts a comment into the ThreadComments table and returns the inserted comment.
 * @param author - The ID of the author.
 * @param post - The ID of the post.
 * @param description - The content of the comment.
 * @returns The inserted comment along with the author's username.
 */
export async function insertComment(
	author: string,
	post: number,
	description: string
): Promise<Comment> {
	const result = await sql`
		WITH inserted_comment AS (
			INSERT INTO ThreadComments (author, post, description)
			VALUES (${author}, ${post}, ${description})
			RETURNING id, post, description, created_at, author
		)
		SELECT 
			inserted_comment.id, 
			inserted_comment.post, 
			inserted_comment.description, 
			inserted_comment.created_at, 
			Users.username
		FROM inserted_comment
		JOIN Users ON Users.id = inserted_comment.author;
	`
	return <Comment>result.rows[0] // Return the inserted comment
}

/**
 * Inserts a post into the Posts table and returns the inserted post.
 * @param title - The title of the post.
 * @param description - The content of the post.
 * @param category - The category ID for the post.
 * @param author - The ID of the author.
 * @returns The inserted post.
 */
export async function insertPost(
	title: string,
	description: string,
	category: number,
	author: string
): Promise<DbPost> {
	const result = await sql`
		INSERT INTO posts (title, description, category, author)
		VALUES (${title}, ${description}, ${category}, ${author})
		RETURNING *;
	`
	return result.rows[0] as DbPost // Return the inserted post
}

/**
 * Fetches the permission for a specific role.
 * @param roleId - The role ID.
 * @returns The permission level of the role.
 */
export async function getRolePermission(roleId: number) {
	const result = await sql`
		SELECT permission FROM Roles WHERE id = ${roleId}
	`
	return result.rows[0]?.permission // Return the permission level
}

/**
 * Updates the role of a user in the Users table.
 * @param userId - The ID of the user whose role is being updated.
 * @param roleId - The new role ID to assign to the user.
 */
export async function updateUserRole(userId: number, roleId: number) {
	await sql`UPDATE Users SET role = ${roleId} WHERE id = ${userId}`
}

/**
 * Fetches the hashed password of a user based on their email.
 * @param email - The user's email.
 * @returns The hashed password of the user.
 */
export async function getHashedPasswordByEmail(email: string) {
	const result =
		await sql`SELECT hashed_password FROM Users WHERE email = ${email} AND deleted_at IS NULL`
	return result.rows[0]?.hashed_password // Return the hashed password or undefined
}

/**
 * Updates the hashed password of a user based on their email.
 * @param email - The user's email.
 * @param newHashedPassword - The new hashed password.
 */
export async function updateUserPassword(
	email: string,
	newHashedPassword: string
) {
	await sql`UPDATE Users SET hashed_password = ${newHashedPassword} WHERE email = ${email}`
}

/**
 * Retrieves the total count of comments from the ThreadComments table.
 * @returns The total count of comments.
 */
export async function getTotalComments(): Promise<number> {
	const { rows } =
		await sql`SELECT COUNT(*) AS total_comments FROM ThreadComments`
	return rows[0].total_comments // Return the total count of comments
}

/**
 * Activates a user by setting deleted_at to NULL.
 * @param email The email of the user to activate.
 */
export async function activateUserByEmail(email: string) {
	await sql`UPDATE Users SET deleted_at = NULL WHERE email = ${email}`
}

/**
 * Checks if an email is already in use.
 * @param email The email to check.
 * @returns True if the email is used, false otherwise.
 */
export async function isEmailUsed(email: string) {
	const result = await sql`SELECT email FROM Users WHERE email = ${email}`
	return result.rows.length > 0
}

/**
 * Inserts a new user into the database.
 * @param username The username of the new user.
 * @param role The role ID of the new user.
 * @param email The email of the new user.
 * @param hashedPassword The hashed password of the new user.
 */
export async function createUser(
	username: string,
	role: number,
	email: string,
	hashedPassword: string
) {
	await sql`INSERT INTO Users (username, role, email, hashed_password) VALUES (${username}, ${role}, ${email}, ${hashedPassword}) RETURNING *`
}

/**
 * Fetches comment counts grouped by post for a specific user.
 * @param email The email of the user to filter comments.
 * @returns An array of objects containing post IDs and comment counts.
 */
export async function getCommentsByPost(email: string) {
	const result = await sql`
        SELECT post, COUNT(*) as comment_count
        FROM ThreadComments
        JOIN Users ON ThreadComments.author = Users.id
        WHERE Users.email = ${email}
        GROUP BY post;
    `
	return result.rows // Return the rows directly
}

type CategoryPostCountRow = {
	category_name: string
	post_count: number
}

/**
 * Fetch the number of posts for each category.
 * @returns A promise that resolves to a record mapping category names to post counts.
 */
export async function getCategoryPostCounts(): Promise<Record<string, number>> {
	const result = await sql`
		SELECT c.name AS category_name, COUNT(p.id) AS post_count
		FROM Category c
		LEFT JOIN Posts p ON c.id = p.category
		GROUP BY c.id;
	`
	const rows = result.rows as CategoryPostCountRow[]
	const categoryPostCounts = rows.reduce((acc: Record<string, number>, row) => {
		acc[row.category_name] = row.post_count
		return acc
	}, {})

	return categoryPostCounts
}

type RoleUserCountRow = {
	role_type: string
	user_count: number
}

/**
 * Fetch the number of users for each role.
 * @returns A promise that resolves to a record mapping role types to user counts.
 */
export async function getRoleUserCounts(): Promise<Record<string, number>> {
	const result = await sql`
		SELECT r.type AS role_type, COUNT(u.id) AS user_count
		FROM Roles r
		LEFT JOIN Users u ON r.id = u.role
		GROUP BY r.id;
	`

	const rows = result.rows as RoleUserCountRow[]
	const roleUserCounts = rows.reduce(
		(acc: Record<string, number>, row: RoleUserCountRow) => {
			acc[row.role_type] = row.user_count
			return acc
		},
		{}
	)

	return roleUserCounts
}
