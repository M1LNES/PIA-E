import { getServerSession } from 'next-auth'
import { AppError } from '../utils/errors'
import { Session } from 'next-auth'

/**
 * Validates and retrieves the current session.
 *
 * @returns {Promise<Session>} - The session object if valid.
 * @throws {AppError} - Throws if the session is invalid or not found.
 */
export async function validateSession(): Promise<Session> {
	const session = await getServerSession()
	if (!session) {
		throw new AppError('Unauthorized!', 401, 'Someone accessed without session')
	}

	return session
	/* We know that if session is active, it will containt user info and email - that's why we will use
	session.user?.email as string type assertion
	*/
}
