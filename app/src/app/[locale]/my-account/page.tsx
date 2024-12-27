'use client'
import { useQuery } from '@tanstack/react-query'
import Layout from '../home/main-page-layout'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { changePassword, fetchUserData } from '../services/data-service'
import { useEffect, useState } from 'react'
import LoadingSpinner from '../components/loading-spinner'

/**
 * MyAccount Component:
 *
 * This component provides an interface for users to view their account details (username, email, role)
 * and allows them to change their password. The form includes fields to input the old password, new password,
 * and confirm the new password. The component fetches the user data via a query based on the current session
 * (user's email) and displays a loading spinner while the data is being fetched. The change password form is
 * validated to ensure the new password and confirmation match before the form can be submitted.
 *
 * The component is built using React hooks, React Query, and NextAuth for authentication and session management.
 */
export default function MyAccount() {
	// Translate the page text using next-intl
	const t = useTranslations('pages.my-account')

	// Get the current session data using next-auth
	const { data: session } = useSession()

	// State variables to hold form values and button disabled state
	const [oldPassword, setOldPassword] = useState<string>('')
	const [newPassword, setNewPassword] = useState<string>('')
	const [newPasswordConfirm, setNewPasswordConfirm] = useState<string>('')
	const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true)

	// Fetch user data using react-query, triggered by the user's email
	const { data: user, isLoading } = useQuery({
		queryKey: ['userData', session?.user?.email],
		queryFn: () => fetchUserData(session?.user?.email as string),
		enabled: !!session?.user?.email, // Only fetch if the email exists
	})

	/**
	 * Handles password change form submission.
	 * It sends the old and new passwords to the server for validation and update.
	 *
	 * @param {React.FormEvent} event - The form submission event.
	 */
	const handleChangePassword = async (event: React.FormEvent) => {
		event.preventDefault()

		// Prepare data for password change request
		const postData = {
			email: user.email,
			oldPassword,
			newPassword,
			newPasswordConfirm,
		}

		try {
			// Call the changePassword function to update the password
			await changePassword(postData)

			alert('Password successfully changed!')
			window.location.reload() // Reload the page to reflect the changes
		} catch (error) {
			// Handle any errors during the password change request
			console.error('Error:', error)
			alert('Error during changing password.')
		}
	}

	// Effect hook to disable the submit button if password fields are not valid
	useEffect(() => {
		setIsButtonDisabled(
			!oldPassword || !newPassword || newPassword !== newPasswordConfirm
		)
	}, [oldPassword, newPassword, newPasswordConfirm])

	return (
		<Layout>
			<main className="flex-grow bg-gray-100 p-6">
				{isLoading ? (
					// Show loading spinner while data is being fetched
					<LoadingSpinner />
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
								{/* Old Password Input */}
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

								{/* New Password Input */}
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

								{/* Confirm New Password Input */}
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

								{/* Submit Button */}
								<button
									disabled={isButtonDisabled}
									type="submit"
									className={`w-full py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
										isButtonDisabled
											? 'bg-gray-300 text-gray-500 cursor-not-allowed'
											: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500'
									}`}
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
