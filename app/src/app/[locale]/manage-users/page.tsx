'use client'
import { useState } from 'react'
import Layout from '../home/main-page-layout'
import { fetchAllRoles, fetchAllUsers } from '../services/data-service'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import UserButton from '../components/user-button'

interface Users {
	id: number
	username: string
	email: string
	deleted_at: number | null
	type: string
}

type Role = {
	id: number
	type: string
	permission: number
}

export default function AddingUseer() {
	const t = useTranslations('pages.managing-users')

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
		queryFn: () => fetchAllRoles(setSelectedRole),
	})

	const createNewUser = async (event: React.FormEvent) => {
		event.preventDefault()

		const postData = {
			username,
			email,
			selectedRole,
			password,
			confirmPassword,
		}
		try {
			const response = await fetch('/api/users/add-user', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(postData),
			})

			const result = await response.json()
			if (result.status === 200) {
				alert('User added successfully')
			} else {
				alert('Error adding user')
			}
		} catch (error) {
			console.error('Error:', error)
			alert('Error adding user')
		}
	}

	return (
		<Layout>
			<main className="flex-grow bg-gray-100 p-6">
				<h2 className="text-2xl font-semibold mb-6">{t('page-title')}</h2>
				<form
					className="bg-white p-6 shadow-lg rounded-lg"
					onSubmit={createNewUser}
				>
					<div className="mb-4">
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
						{areRolesLoading ? (
							<>LOADING</>
						) : (
							<select
								id="role"
								className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								value={selectedRole}
								onChange={(e) => setSelectedRole(parseInt(e.target.value))}
								required
							>
								{roles.map((role: Role) => (
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
											{item.type}
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
													onClick={() => console.log('ACTIVATE')}
													label="Activate User TODO"
													color="green"
												/>
											) : (
												<UserButton
													onClick={() => console.log('DISABLE')}
													label="Disable User TODO"
													color="red"
												/>
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
