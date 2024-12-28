import { getRoleUserCounts } from '../utils/queries'

export async function getRoleUserCountsPublic() {
	return await await getRoleUserCounts()
}
