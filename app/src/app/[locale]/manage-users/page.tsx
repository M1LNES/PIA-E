'use client'
import { useState } from 'react'
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

interface Users {
	id: number
	username: string
	email: string
	deleted_at: number | null
	roleid: number
}

type Role = {
	id: number
	type: string
	permission: number
}

export default function AddingUser() {
	const t = useTranslations('pages.managing-users')
	const { data: session } = useSession()

	const [username, setUsername] = useState<string>('')
	const [email, setEmail] = useState<string>('')
	const [selectedRole, setSelectedRole] = useState<number>(-1)
	const [password, setPassword] = useState<string>('')
	const [confirmPassword, setConfirmPassword] = useState<string>('')

	const { data, isLoading } = useQuery({
		queryKey: ['users'],
		queryFn: () => fetchAllUsers(),
	})

	const { data: roles, isLoading: areRolesLoading } = useQuery({
		queryKey: ['roles'],
		queryFn: () => fetchAllRoles(),
	})

	const { data: userRolePermission, isLoading: isUsersRolePermissionLoading } =
		useQuery({
			queryKey: ['user-permissions'],
			queryFn: () => {
				const currentUser = data.find(
					(me: Users) => me.email === session?.user?.email
				)
				const permission = roles.find(
					(role: Role) => role.id === currentUser.roleid
				).permission
				return permission
			},
			enabled: !areRolesLoading && !isLoading,
		})

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
			const result = await createNewUser(postData)
			if (result.status === 200) {
				alert('User added successfully')
				window.location.reload()
			} else {
				alert('Error adding user')
			}
		} catch (error) {
			console.error('Error:', error)
			alert('Error adding user')
		}
	}

	const handleDisableUser = async (event: React.FormEvent, email: string) => {
		event.preventDefault()
		const confirmText = `Do you really want to disable user with e-mail ${email}?`
		if (confirm(confirmText)) {
			try {
				const result = await disableUser(email)
				if (result.status === 200) {
					alert('User successfuly disabled.')
					window.location.reload()
				} else {
					alert('Error during disabling user')
				}
			} catch (error) {
				console.error('Error:', error)
				alert('Error during disabling user')
			}
		} else {
			alert('Aborting user deactivation...')
		}
	}

	const handleActivateUser = async (event: React.FormEvent, email: string) => {
		event.preventDefault()
		const confirmText = `Do you really want to activate user with e-mail ${email}?`

		if (confirm(confirmText)) {
			try {
				const result = await activateUser(email)
				if (result.status === 200) {
					alert('User successfuly re-activated.')
					window.location.reload()
				} else {
					alert('Error during re-activating user.')
				}
			} catch (error) {
				console.error('Error:', error)
				alert('Error re-activating user')
			}
		} else {
			alert('Aborting activation...')
		}
	}

	const handleChangeUserRole = async (event: React.FormEvent, item: Users) => {
		event.preventDefault()
		const confirmText = `Do you really want to switch ${
			item.username
		}'s role to ${
			roles.find(
				(option: Role) =>
					option.id === parseInt((event.target as HTMLInputElement).value)
			).type
		}?`

		if (confirm(confirmText)) {
			try {
				const result = await changeUserRole(
					item.id,
					parseInt((event.target as HTMLInputElement).value)
				)
				if (result.status === 200) {
					alert('User role succesfully updated!')
					window.location.reload()
				} else {
					alert('Error occured during changing users role.')
				}
			} catch {
				alert('Unexpected error occured.')
			}
		} else {
			alert('Aborting role changing...')
			;(event.target as HTMLInputElement).value = item.roleid.toString()
		}
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
						{areRolesLoading || isUsersRolePermissionLoading ? (
							<>LOADING</>
						) : (
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
									.filter((role: Role) => role.permission < userRolePermission)
									.map((role: Role) => (
										<option key={role.id} value={role.id}>
											{role.type}
										</option>
									))}
							</select>
						)}
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
						className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						{t('submit-post')}
					</button>
				</form>

				<div className="mb-4">
					<label
						htmlFor="category"
						className="block text-gray-700 font-semibold mb-2"
					>
						{t('available-users')}
					</label>
					{isLoading ? (
						<>{t('loading')}</>
					) : (
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
								{data.map((item: Users) => (
									<tr key={item.id} className="hover:bg-gray-100">
										<td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
											{item.username}
										</td>
										<td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
											{areRolesLoading || isUsersRolePermissionLoading ? (
												<>{item.roleid}</>
											) : item.email === session?.user?.email ||
											  userRolePermission <=
													roles.find((rItem: Role) => rItem.id === item.roleid)
														.permission ? (
												`${
													roles.find((rItem: Role) => rItem.id === item.roleid)
														.type
												}`
											) : (
												<select
													value={item.roleid}
													onChange={(e) => handleChangeUserRole(e, item)}
												>
													{roles
														.filter(
															(role: Role) =>
																role.permission < userRolePermission
														)
														.map((role: Role) => (
															<option key={role.id} value={role.id}>
																{role.type}
															</option>
														))}
												</select>
											)}
										</td>

										<td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
											{item.email}
										</td>
										<td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
											{item.deleted_at || 'ACTIVE'}
										</td>
										<td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
											{item.deleted_at ? (
												<UserButton
													onClick={(event: React.FormEvent) =>
														handleActivateUser(event, item.email)
													}
													label="Activate User"
													color="green"
												/>
											) : (
												item.email !== session?.user?.email && (
													<UserButton
														onClick={(event: React.FormEvent) =>
															handleDisableUser(event, item.email)
														}
														label="Disable User"
														color="red"
													/>
												)
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
			</main>
		</Layout>
	)
}
