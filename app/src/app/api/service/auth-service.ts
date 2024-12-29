import bcrypt from 'bcrypt'
import {
	getAllActiveUsers,
	getUserByEmailAndNotDeleted,
} from '../utils/queries'
import { Account, Profile, User } from 'next-auth'

/**
 * Custom authorization function to verify user credentials.
 * @param {object} credentials - User credentials (email, password).
 * @returns {object|null} - Authenticated user object or null if invalid.
 */
export async function authorize(credentials: {
	email: string
	password: string
}): Promise<null | User> {
	if (!credentials) return null
	const { email, password } = credentials

	const row = await getUserByEmailAndNotDeleted(email)

	if (!row) {
		return null
	}

	const user = {
		id: row.id,
		name: row.username,
		email: row.email,
	}

	// Compare provided password with stored hashed password
	const arePasswordsSame = bcrypt.compareSync(password, row.hashed_password)
	return arePasswordsSame ? user : null
}

/**
 * Callback to control sign-in behavior.
 * Allows Google sign-in if email is present in the database.
 * @param {object} account - Account details of the sign-in attempt.
 * @param {object} profile - Profile data from the provider.
 * @returns {boolean} - True if sign-in is allowed, false otherwise.
 */
export async function signIn({
	account,
	profile,
}: {
	account: Account
	profile: Profile
}): Promise<boolean> {
	if (account?.provider === 'credentials') {
		return true
	}

	if (account?.provider === 'google') {
		try {
			const users = await getAllActiveUsers()
			// Allow Google sign-in if user's email is in the database
			return users.some((user) => user.email === profile?.email)
		} catch {
			return false
		}
	}
	return false
}
