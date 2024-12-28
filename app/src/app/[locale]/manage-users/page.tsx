'use client'
import { useEffect, useState } from 'react'
import Layout from '../home/main-page-layout'
import {
	activateUser,
	changeUserRole,
	createNewUser,
	disableUser,
	fetchAllRoles,
	fetchAllUsers,
} from '../services/data-service'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import UserButton from '../components/user-button'
import { useSession } from 'next-auth/react'
import LoadingSpinner from '../components/loading-spinner'
import config from '@/app/config'
import { RoleDomain, UserDomain } from '@/dto/types'

/**
 * A component for adding new users and managing existing users.
 * It allows for creating new users, disabling, reactivating users,
 * and changing their roles. Displays a list of users with their
 * respective roles and actions (enable, disable, change role).
 */
export default function AddingUser() {
	// Translations for the page
	const t = useTranslations('pages.managing-users')
	const { data: session } = useSession()

	// State variables for form fields and button state
	const [username, setUsername] = useState<string>('')
	const [email, setEmail] = useState<string>('')
	const [selectedRole, setSelectedRole] = useState<number>(-1)
	const [password, setPassword] = useState<string>('')
	const [confirmPassword, setConfirmPassword] = useState<string>('')
	const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true)

	// Fetch data for users and roles
	const { data, isLoading } = useQuery({
		queryKey: ['users'],
		queryFn: () => fetchAllUsers(),
	})
	const { data: roles, isLoading: areRolesLoading } = useQuery({
		queryKey: ['roles'],
		queryFn: () => fetchAllRoles(),
	})

	// Fetch the user's role permission
	const { data: userRolePermission, isLoading: isUsersRolePermissionLoading } =
		useQuery({
			queryKey: ['user-permissions'],
			queryFn: () => {
				// Find the current user based on session email
				const currentUser = data.find(
					(me: UserDomain) => me.userEmail === session?.user?.email
				)
				const permission = roles.find(
					(role: RoleDomain) => role.roleId === currentUser.roleId
				)?.rolePermission
				return permission
			},
			enabled: !areRolesLoading && !isLoading && data !== undefined,
		})

	/**
	 * Handles form submission to create a new user.
	 * Validates the form fields and sends the data to the backend service.
	 * @param event - The form submit event.
	 */
	const handleCreateNewUser = async (event: React.FormEvent) => {
		event.preventDefault()
		const postData = {
			username,
			email,
			selectedRole,
			password,
			confirmPassword,
		}
		try {
			await createNewUser(postData)
			alert('User added successfully')
			window.location.reload()
		} catch (error) {
			console.error('Error:', error)
			alert('Error adding user')
		}
	}

	/**
	 * Handles disabling a user account.
	 * Prompts the user for confirmation and then disables the account via the backend service.
	 * @param event - The form submit event.
	 * @param email - The email address of the user to disable.
	 */
	const handleDisableUser = async (event: React.FormEvent, email: string) => {
		event.preventDefault()
		const confirmText = `Do you really want to disable user with e-mail ${email}?`
		if (confirm(confirmText)) {
			try {
				await disableUser(email)
				alert('User successfully disabled.')
				window.location.reload()
			} catch (error) {
				console.error('Error:', error)
				alert('Error during disabling user')
			}
		} else {
			alert('Aborting user deactivation...')
		}
	}

	/**
	 * Handles reactivating a user account.
	 * Prompts the user for confirmation and then reactivates the account via the backend service.
	 * @param event - The form submit event.
	 * @param email - The email address of the user to activate.
	 */
	const handleActivateUser = async (event: React.FormEvent, email: string) => {
		event.preventDefault()
		const confirmText = `Do you really want to activate user with e-mail ${email}?`

		if (confirm(confirmText)) {
			try {
				await activateUser(email)
				alert('User successfully re-activated.')
				window.location.reload()
			} catch (error) {
				console.error('Error:', error)
				alert('Error re-activating user')
			}
		} else {
			alert('Aborting activation...')
		}
	}

	/**
	 * Handles changing a user's role.
	 * Prompts the user for confirmation and then updates the role via the backend service.
	 * @param event - The form submit event.
	 * @param item - The user whose role will be changed.
	 */
	const handleChangeUserRole = async (
		event: React.FormEvent,
		item: UserDomain
	) => {
		event.preventDefault()
		const confirmText = `Do you really want to switch ${
			item.username
		}'s role to ${
			roles.find(
				(option: RoleDomain) =>
					option.roleId === parseInt((event.target as HTMLInputElement).value)
			)?.roleType
		}?`

		if (confirm(confirmText)) {
			try {
				await changeUserRole(
					item.userId,
					parseInt((event.target as HTMLInputElement).value)
				)
				alert('User role successfully updated!')
				window.location.reload()
			} catch {
				alert('Unexpected error occured.')
			}
		} else {
			alert('Aborting role changing...')
			;(event.target as HTMLInputElement).value = item.roleId.toString()
		}
	}

	/**
	 * Checks if the form is valid based on the input fields.
	 * Updates the button's disabled state accordingly.
	 */
	useEffect(() => {
		const isFormInvalid = () => {
			return (
				!email ||
				!config.validation.emailRegex.test(email) ||
				!username ||
				!password ||
				password !== confirmPassword ||
				selectedRole === -1 ||
				data.some((item: UserDomain) => item.userEmail === email)
			)
		}

		setIsButtonDisabled(isFormInvalid())
	}, [email, username, password, confirmPassword, selectedRole, data])

	// Loading state while data is being fetched
	if (isLoading || areRolesLoading || isUsersRolePermissionLoading) {
		return (
			<Layout>
				<LoadingSpinner />
			</Layout>
		)
	}

	return (
		<Layout>
			<main className="flex-grow bg-gray-100 p-6">
				<h2 className="text-2xl font-semibold mb-6">{t('page-title')}</h2>
				<form
					className="bg-white p-6 shadow-lg rounded-lg"
					onSubmit={handleCreateNewUser}
				>
					<div className="mb-4">
						<h3 className="text-xl font-medium mb-4">{t('creating-user')}</h3>
						<label
							htmlFor="username"
							className="block text-gray-700 font-semibold mb-2"
						>
							{t('form.username')}
						</label>
						<input
							type="text"
							id="username"
							className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
						/>
					</div>

					<div className="mb-4">
						<label
							htmlFor="email"
							className="block text-gray-700 font-semibold mb-2"
						>
							{t('form.email')}
						</label>
						<input
							type="email"
							id="email"
							className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>

					<div className="mb-4">
						<label
							htmlFor="role"
							className="block text-gray-700 font-semibold mb-2"
						>
							{t('form.role')}
						</label>

						<select
							id="role"
							className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							value={selectedRole}
							onChange={(e) => setSelectedRole(parseInt(e.target.value))}
							required
						>
							<option key={-1} value={-1}>
								{t('form.select-user-role')}
							</option>
							{roles
								.filter(
									(role: RoleDomain) => role.rolePermission < userRolePermission
								)
								.map((role: RoleDomain) => (
									<option key={role.roleId} value={role.roleId}>
										{role.roleType}
									</option>
								))}
						</select>
					</div>

					{/* Password */}
					<div className="mb-4">
						<label
							htmlFor="password"
							className="block text-gray-700 font-semibold mb-2"
						>
							{t('form.password')}
						</label>
						<input
							type="password"
							id="password"
							className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>

					{/* Confirm Password */}
					<div className="mb-4">
						<label
							htmlFor="confirmPassword"
							className="block text-gray-700 font-semibold mb-2"
						>
							{t('form.password-confirm')}
						</label>
						<input
							type="password"
							id="confirmPassword"
							className={`w-full p-2 rounded-lg focus:outline-none focus:ring-2 
							${
								confirmPassword === password
									? 'border-green-500 focus:ring-green-500'
									: 'border-red-500 focus:ring-red-500'
							} 
							border border-gray-300`}
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
						/>
					</div>

					<button
						type="submit"
						className={`w-full py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
							isButtonDisabled
								? 'bg-gray-300 text-gray-500 cursor-not-allowed'
								: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500'
						}`}
						disabled={isButtonDisabled}
					>
						{t('submit-post')}
					</button>
				</form>

				<div className="mb-4 overflow-x-scroll">
					<label
						htmlFor="category"
						className="block text-gray-700 font-semibold mb-2"
					>
						{t('available-users')}
					</label>
					<table className="min-w-full bg-white">
						<thead>
							<tr>
								<th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-medium text-gray-700">
									{t('table.username')}
								</th>
								<th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-medium text-gray-700">
									{t('table.role')}
								</th>
								<th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-medium text-gray-700">
									{t('table.email')}
								</th>
								<th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-medium text-gray-700">
									{t('table.deleted-at')}
								</th>
								<th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-medium text-gray-700">
									{t('table.action')}
								</th>
							</tr>
						</thead>
						<tbody>
							{data.map((item: UserDomain) => (
								<tr key={item.userId} className="hover:bg-gray-100">
									<td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
										{item.username}
									</td>
									<td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
										{item.userEmail === session?.user?.email ||
										item.deletedTime ||
										userRolePermission <=
											roles.find(
												(rItem: RoleDomain) => rItem.roleId === item.roleId
											)?.rolePermission ? (
											`${
												roles.find(
													(rItem: RoleDomain) => rItem.roleId === item.roleId
												)?.roleType
											}`
										) : (
											<select
												value={item.roleId}
												onChange={(e) => handleChangeUserRole(e, item)}
											>
												{roles
													.filter(
														(role: RoleDomain) =>
															role.rolePermission < userRolePermission
													)
													.map((role: RoleDomain) => (
														<option key={role.roleId} value={role.roleId}>
															{role.roleType}
														</option>
													))}
											</select>
										)}
									</td>

									<td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
										{item.userEmail}
									</td>
									<td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
										{item.deletedTime || t('table.active')}
									</td>
									<td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
										{item.deletedTime
											? userRolePermission >
													roles.find(
														(rItem: RoleDomain) => rItem.roleId === item.roleId
													)?.rolePermission && (
													<UserButton
														onClick={(event: React.FormEvent) =>
															handleActivateUser(event, item.userEmail)
														}
														label={t('table.activate')}
														color="green"
													/>
											  )
											: userRolePermission >
													roles.find(
														(rItem: RoleDomain) => rItem.roleId === item.roleId
													)?.rolePermission && (
													<UserButton
														onClick={(event: React.FormEvent) =>
															handleDisableUser(event, item.userEmail)
														}
														label={t('table.disable')}
														color="red"
													/>
											  )}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</main>
		</Layout>
	)
}
