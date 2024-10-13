'use client'
import { useQuery } from '@tanstack/react-query'
import Layout from '../home/main-page-layout'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { changePassword, fetchUserData } from '../services/data-service'
import { useState } from 'react'

export default function MyAccount() {
	const t = useTranslations('pages.my-account')
	const { data: session } = useSession()

	const [oldPassword, setOldPassword] = useState<string>('')
	const [newPassword, setNewPassword] = useState<string>('')
	const [newPasswordConfirm, setNewPasswordConfirm] = useState<string>('')

	const { data: user, isLoading } = useQuery({
		queryKey: ['userData', session?.user?.email],
		queryFn: () => fetchUserData(session?.user?.email as string),
		enabled: !!session?.user?.email,
	})

	const handleChangePassword = async (event: React.FormEvent) => {
		event.preventDefault()
		const postData = {
			email: user.email,
			oldPassword,
			newPassword,
			newPasswordConfirm,
		}
		try {
			const result = await changePassword(postData)
			if (result.status === 200) {
				alert('Password succesfully changed!')
				window.location.reload()
			} else {
				alert(`Error during changing password. Status: ${result.status}`)
			}
		} catch (error) {
			console.error('Error:', error)
			alert('Error during changing password.')
		}
	}
	return (
		<Layout>
			<main className="flex-grow bg-gray-100 p-6">
				{isLoading ? (
					<div>LOADING...</div>
				) : !session || !user ? (
					<div>NO ACCESS</div>
				) : (
					<>
						{/* User Information Overview */}
						<h2 className="text-2xl font-semibold mb-6">{t('title')}</h2>
						<div className="bg-white p-6 rounded-lg shadow-md mb-6">
							<h3 className="text-xl font-medium mb-4">{t('overview')}</h3>
							<div className="mb-4">
								<label className="block text-sm font-semibold">
									{t('username')}
								</label>
								<p className="text-gray-700">{user.username}</p>
							</div>
							<div className="mb-4">
								<label className="block text-sm font-semibold">
									{t('email')}
								</label>
								<p className="text-gray-700">{user.email}</p>
							</div>
							<div className="mb-4">
								<label className="block text-sm font-semibold">
									{t('role')}
								</label>
								<p className="text-gray-700">{user.type}</p>
							</div>
						</div>

						{/* Change Password Form */}
						<div className="bg-white p-6 rounded-lg shadow-md">
							<h3 className="text-xl font-medium mb-4">
								{t('changePassword')}
							</h3>
							<form onSubmit={handleChangePassword}>
								<div className="mb-4">
									<label
										htmlFor="oldPassword"
										className="block text-sm font-semibold"
									>
										{t('oldPassword')}
									</label>
									<input
										type="password"
										id="oldPassword"
										name="oldPassword"
										className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
										required
										value={oldPassword}
										onChange={(e) => setOldPassword(e.target.value)}
									/>
								</div>
								<div className="mb-4">
									<label
										htmlFor="newPassword"
										className="block text-sm font-semibold"
									>
										{t('newPassword')}
									</label>
									<input
										type="password"
										id="newPassword"
										name="newPassword"
										className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
										required
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
									/>
								</div>
								<div className="mb-4">
									<label
										htmlFor="confirmNewPassword"
										className="block text-sm font-semibold"
									>
										{t('confirmNewPassword')}
									</label>
									<input
										type="password"
										id="confirmNewPassword"
										name="confirmNewPassword"
										className={`mt-1 block w-full p-2 border rounded-md ${
											newPasswordConfirm === newPassword
												? 'border-green-500 focus:ring-green-500'
												: 'border-red-500 focus:ring-red-500'
										} `}
										required
										value={newPasswordConfirm}
										onChange={(e) => setNewPasswordConfirm(e.target.value)}
									/>
								</div>
								<button
									type="submit"
									className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200"
								>
									{t('updatePassword')}
								</button>
							</form>
						</div>
					</>
				)}
			</main>
		</Layout>
	)
}
