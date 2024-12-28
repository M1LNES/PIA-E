import config from '@/app/config'
import { AppError } from '../utils/errors'
import {
	activateUserByEmail,
	createUser,
	disableUserByEmail,
	getAllUsersWithRoles,
	getDeletedUserByEmail,
	getHashedPasswordByEmail,
	getRolePermission,
	getRoleUserCounts,
	getUserByEmail,
	getUserDetailsById,
	getUserWithPermissions,
	isEmailUsed,
	updateUserPassword,
	updateUserRole,
} from '../utils/queries'
import { validateSession } from './session-service'
import bcrypt from 'bcrypt'
import { mapUserSelfInfoToDomain, mapUsersToDomains } from '../utils/dtos'

export async function getRoleUserCountsPublic() {
	return await await getRoleUserCounts()
}

export async function activateUser(email: string) {
	const session = await validateSession()

	// Check if the email is provided; return a 400 Bad Request response if not
	if (!email) {
		throw new AppError(
			'Email not specified!',
			400,
			`User ${session.user?.email} did not specify email`
		)
	}

	/* Authorization */
	// Fetch the user and check if the target user (email) is deleted
	const [user, deletedUser] = await Promise.all([
		getUserByEmail(session.user?.email as string), // Fetch the requesting user's data
		getDeletedUserByEmail(email), // Fetch the target user data if they are deleted
	])

	// Check if the user has the necessary permissions or if the target user has higher permissions
	if (
		user.permission < config.pages.manageUsers.minPermission || // Check if the user has the required permission
		(deletedUser && deletedUser.permission >= user.permission) // Check if the deleted user has higher permissions
	) {
		throw new AppError(
			'Not enough permissions!',
			403,
			`User ${session.user?.email} does not have enough permissions.`
		)
	}

	// Reactivate the user with the provided email
	await activateUserByEmail(email)
}
export async function deactivateUser(email: string) {
	const session = await validateSession()

	// Validate the email field is provided in the request
	if (!email) {
		throw new AppError(
			'Email not specified!',
			400,
			`User ${session.user?.email} did not specify email`
		)
	}

	// Fetch the logged-in user's permissions and check if they are allowed to disable users
	const user = await getUserWithPermissions(session.user?.email as string)
	const deletedUser = await getDeletedUserByEmail(email)

	// Check if the logged-in user has enough permissions or if the target user is not allowed to be disabled
	if (
		!user ||
		user.permission < config.pages.manageUsers.minPermission || // User does not have permission to manage users
		(deletedUser && deletedUser.permission >= user.permission) // Cannot disable users with equal or higher permissions
	) {
		throw new AppError(
			'Not enough permissions!',
			403,
			`User ${session.user?.email} tried to call endpoint, but did not have enough permissions!`
		)
	}

	await disableUserByEmail(email)
}

export async function changePassword(
	email: string,
	oldPassword: string,
	newPassword: string,
	newPasswordConfirm: string
) {
	const session = await validateSession()

	/* Authorization: Ensure the request is coming from the logged-in user */
	if (email !== session?.user?.email) {
		throw new AppError(
			'Not enough permissions!',
			403,
			`User ${session.user?.email} tried to access other user's (${email}) data!`
		)
	}

	// Fetch the hashed password of the user from the database
	const hashedPassword = await getHashedPasswordByEmail(email)

	// If no user is found, log the event and return an error response
	if (!hashedPassword) {
		throw new AppError(
			'Not enough permissions!',
			403,
			`User ${session.user?.email} was not found in DB! Most likely they are deactivated.`
		)
	}

	// Compare the provided old password with the stored hashed password
	const isPreviousPasswordSame = await bcrypt.compare(
		oldPassword,
		hashedPassword
	)

	// If the old password does not match, log the event and return an error response
	if (!isPreviousPasswordSame) {
		throw new AppError(
			'You provided the wrong old password!',
			400,
			`User ${session.user?.email} provided wrong old password.`
		)
	}

	// Check if the new password and confirmation password match
	if (newPasswordConfirm !== newPassword) {
		throw new AppError(
			'New password and confirm password are not the same!',
			400,
			`${session.user?.email}'s password confirmation does not match.`
		)
	}

	// Ensure that the new password is not the same as the old password
	if (oldPassword === newPassword) {
		throw new AppError(
			'New password is the same as the old password!',
			400,
			`${session.user?.email}'s new and old passwords were same.`
		)
	}

	// Hash the new password and update it in the database
	const newHashedPassword = await bcrypt.hash(newPassword, config.saltRounds)
	await updateUserPassword(email, newHashedPassword)
}

export async function changeRole(userId: number, roleId: number) {
	const session = await validateSession()

	// Validate the required fields (userId and roleId) are present
	if (!userId || !roleId) {
		throw new AppError(
			'Required values are invalid',
			400,
			`User ${session.user?.email} provided invalid values:`
		)
	}

	/* Authorization: Ensure the logged-in user has the appropriate permissions to change the role */

	// Fetch the current user, the user to be updated, and the permissions associated with the new role
	const [dbUser, updatedUser, rolePerm] = await Promise.all([
		getUserByEmail(session.user?.email as string),
		getUserDetailsById(userId),
		getRolePermission(roleId),
	])

	// If any of the fetched data is missing, log the event and return an error response
	if (!dbUser || !updatedUser || rolePerm === undefined) {
		throw new AppError(
			'User or role not found',
			400,
			`User or role not found...`
		)
	}

	// Check if the current user has sufficient permissions to change the role
	if (
		dbUser.permission < config.pages.manageUsers.minPermission || // User does not have permission to manage users
		updatedUser.permission >= dbUser.permission || // Cannot demote or change role of users with higher or equal permissions
		dbUser.permission <= rolePerm // User cannot assign a role with equal or higher permission
	) {
		throw new AppError(
			'Not enough permissions!',
			403,
			`User ${session.user?.email} tried to call endpoint, but did not have enough permissions!`
		)
	}

	// Update the user's role in the database
	await updateUserRole(userId, roleId)
}

export async function getSelfInfo(email: string) {
	const session = await validateSession()

	// If no email is provided, return a bad request response
	if (!email) {
		throw new AppError(
			'Email not specified!',
			400,
			`User ${session.user?.email} tried to access endpoint without specifying e-mail address.`
		)
	}

	// Ensure that the logged-in user is only accessing their own information
	if (email !== session?.user?.email) {
		throw new AppError(
			'Not enough permissions',
			403,
			`User ${session.user?.email} tried to access other user's (${email}) data!`
		)
	}

	// Fetch user information from the database by email
	const user = await getUserByEmail(email)

	return await mapUserSelfInfoToDomain(user)
}

export async function createNewUser(
	username: string,
	email: string,
	selectedRole: number,
	password: string,
	confirmPassword: string
) {
	const session = await validateSession()

	if (
		!username ||
		!email ||
		selectedRole === -1 ||
		!password ||
		!confirmPassword
	) {
		throw new AppError(
			'All fields are required',
			400,
			`User ${session.user?.email} did not specify all the required fields`
		)
	}

	// Check if the passwords match
	if (password !== confirmPassword) {
		throw new AppError(
			'Passwords are not same!',
			400,
			`User ${session.user?.email} provided two different passwords`
		)
	}

	// Validate the email format using a regular expression
	if (!config.validation.emailRegex.test(email)) {
		throw new AppError(
			'Invalid e-mail address',
			400,
			`User ${session.user?.email} provided invalid email address`
		)
	}

	/* Authorization */
	// Fetch the current user and the role permissions for the selected role
	const [user, rolePermission] = await Promise.all([
		getUserByEmail(session.user?.email as string), // Get the requesting user's data
		getRolePermission(selectedRole), // Get the permissions for the selected role
	])

	// Check if the current user has sufficient permissions to create users
	// and if the selected role is not higher than the current user's role
	if (
		user.permission < config.pages.manageUsers.minPermission || // Check if the user has the required permission
		user.permission <= rolePermission // Check if the selected role has lower or equal permissions to the user's role
	) {
		throw new AppError(
			'Not enough permissions!',
			403,
			`User ${session.user?.email} does not have enough permissions.`
		)
	}

	// Check if the email is already in use
	const isUsed = await isEmailUsed(email)
	if (isUsed) {
		throw new AppError(
			'Email is already being used',
			409,
			`User ${session.user?.email} provided email that is already being used`
		)
	}

	// Hash the user's password before saving it to the database
	const hashedPassword = await bcrypt.hash(password, config.saltRounds)
	// Create the new user with the specified details
	await createUser(username, selectedRole, email, hashedPassword)
}

export async function getAllUsers() {
	const session = await validateSession()

	// Fetch the logged-in user's permissions
	const user = await getUserWithPermissions(session.user?.email as string)

	// Check if the logged-in user has sufficient permissions to manage users
	if (user?.permission < config.pages.manageUsers.minPermission) {
		throw new AppError(
			'Not enough permissions!',
			403,
			`User ${session.user?.email} tried to call endpoint, but did not have enough permissions!`
		)
	}

	// Fetch all users with their roles
	const users = await getAllUsersWithRoles()
	return await mapUsersToDomains(users)
}
