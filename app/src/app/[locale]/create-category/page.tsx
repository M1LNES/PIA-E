'use client'

import { useState } from 'react'
import Layout from '../home/main-page-layout'
import { createCategory, fetchAllCategories } from '../services/data-service'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import LoadingSpinner from '../components/loading-spinner'
import { CategoryDomain } from '@/dto/types'

/**
 * `CategoryCreator` Component
 *
 * This component allows the user to create a new category. It fetches the list of existing categories,
 * displays them in a table, and allows the user to input a category name to create a new category.
 * The submit button is disabled if the input title is empty or if the title already exists in the category list.
 *
 * - Displays a list of existing categories.
 * - Allows the user to create a new category.
 * - Disables the submit button when the category name already exists.
 * - Shows a loading spinner while the category data is being fetched.
 *
 * @component
 * @returns {JSX.Element} The rendered component
 */
export default function CategoryCreator() {
	// Internationalization hook to translate text for this page
	const t = useTranslations('pages.create-category')

	// State hooks for category title input and button disabled state
	const [title, setTitle] = useState<string>('')
	const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true)

	// Fetch existing categories using React Query
	const { data, isLoading } = useQuery({
		queryKey: ['categories'],
		queryFn: () => fetchAllCategories(),
	})

	/**
	 * Handles form submission when the user submits the new category form.
	 *
	 * @param {React.FormEvent} event - The form submission event
	 */
	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()
		try {
			// Attempt to create the category via the API
			await createCategory(title)
			alert('Category added successfully')
			window.location.reload() // Reloads the page to show the newly created category
		} catch (error) {
			console.error('Error:', error)
			alert('Error adding category...')
		}
	}

	/**
	 * Checks if the submit button should be enabled or disabled based on the input value.
	 * The button is disabled if the title is empty or the category already exists.
	 *
	 * @param {string} newValue - The new value of the title input
	 */
	const shouldButtonBeDisabled = (newValue: string) => {
		setIsButtonDisabled(
			!newValue ||
				data.some((item: CategoryDomain) => item.categoryName === newValue)
		)
	}

	// Display a loading spinner while the categories are being fetched
	if (isLoading) {
		return (
			<Layout>
				<LoadingSpinner />
			</Layout>
		)
	}

	// Render the form and category list once the data is available
	return (
		<Layout>
			<main className="flex-grow bg-gray-100 p-6">
				<h2 className="text-2xl font-semibold mb-6">{t('page-title')}</h2>
				<form
					onSubmit={handleSubmit}
					className="bg-white p-6 shadow-lg rounded-lg"
				>
					<div className="mb-4">
						<label
							htmlFor="title"
							className="block text-gray-700 font-semibold mb-2"
						>
							{t('title')}
						</label>
						<input
							type="text"
							id="title"
							className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							value={title}
							onChange={(e) => {
								setTitle(e.target.value)
								shouldButtonBeDisabled(e.target.value) // Update button disabled state
							}}
							required
						/>
					</div>

					<div className="mb-4">
						<table className="min-w-full bg-white">
							<thead>
								<tr>
									<th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-medium text-gray-700">
										ID
									</th>
									<th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-medium text-gray-700">
										Name
									</th>
								</tr>
							</thead>
							<tbody>
								{data.map((item: CategoryDomain) => (
									<tr key={item.categoryId} className="hover:bg-gray-100">
										<td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
											{item.categoryId}
										</td>
										<td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
											{item.categoryName}
										</td>
									</tr>
								))}
							</tbody>
						</table>
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
			</main>
		</Layout>
	)
}
