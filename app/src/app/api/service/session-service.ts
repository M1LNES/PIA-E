import { getServerSession } from 'next-auth'
import { AppError } from '../utils/errors'

/**
 * Validates and retrieves the current session.
 *
 * @returns {Promise<any>} - The session object if valid.
 * @throws {AppError} - Throws if the session is invalid or not found.
 */
export async function validateSession() {
	const session = await getServerSession()

	if (!session) {
		throw new AppError('Unauthorized!', 401, 'Someone accessed without session')
	}

	return session
}
