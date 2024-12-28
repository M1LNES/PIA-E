import { getAllRoles, getUserWithPermissions } from '@/app/api/utils/queries'
import config from '@/app/config'
import { AppError } from '../utils/errors'
import { validateSession } from './session-service'
import { mapRolesToDomain } from '../utils/dtos'
import { RoleDomain } from '@/dto/types'

export async function getRolesForUser(): Promise<RoleDomain[]> {
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
	const roles = await getAllRoles()
	return await mapRolesToDomain(roles)
}
