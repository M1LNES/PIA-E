import { getAllRoles, getUserWithPermissions } from '@/app/api/utils/queries'
import config from '@/app/config'
import { AppError } from '../utils/errors'
import { validateSession } from './session-service'

export async function getRolesForUser() {
	// Validate session
	const session = await validateSession()

	// Fetch the user with permissions
	const user = await getUserWithPermissions(session.user?.email as string)

	// Check if the user has sufficient permissions
	if (user.permission < config.pages.manageUsers.minPermission) {
		throw new AppError(
			'Not enough permissions!',
			403,
			`${session.user?.email} tried to fetch roles but did not have enough permissions`
		)
	}

	// Fetch and return roles
	return getAllRoles()
}
