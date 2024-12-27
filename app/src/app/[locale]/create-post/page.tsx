'use client'

import { useEffect, useState } from 'react'
import Layout from '../home/main-page-layout'
import { addPost, fetchAllCategories } from '../services/data-service'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import LoadingSpinner from '../components/loading-spinner'

type Category = {
	name: string
	id: number
}

/**
 * `PostCreator` Component
 *
 * This component allows users to create a new post by providing a title, description, and category.
 * It fetches the list of available categories and enables users to choose one for their post.
 * The submit button is disabled if any of the required fields (title, description, or category) are empty.
 *
 * - Displays a form to create a new post.
 * - Fetches available categories from the server and populates the category dropdown.
 * - Ensures the submit button is disabled until all required fields are filled.
 * - Submits the form and creates a new post via an API call when the submit button is clicked.
 *
 * @component
 * @returns {JSX.Element} The rendered component
 */
export default function PostCreator() {
	// Translation hook for localized text
	const t = useTranslations('pages.create-post')

	// State variables to manage form data
	const [title, setTitle] = useState<string>('') // Post title input value
	const [description, setDescription] = useState<string>('') // Post description input value
	const [category, setCategory] = useState<number>(-1) // Selected category ID
	const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true) // Button disabled state

	// Fetch categories using React Query
	const { data, isLoading } = useQuery({
		queryKey: ['categories'],
		queryFn: () => fetchAllCategories(),
	})

	/**
	 * Handles the form submission event to create a new post.
	 * Sends the post data to the API and provides feedback based on the result.
	 *
	 * @param {React.FormEvent} event - The form submit event
	 */
	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()
		const postData = { title, description, category }
		try {
			// Attempt to create the post using the API
			await addPost(postData)
			alert('Post added successfully')
			window.location.reload() // Reload the page to show the new post
		} catch (error) {
			console.error('Error:', error)
			alert('Error adding post') // Show error if the API call fails
		}
	}

	/**
	 * React hook to enable/disable the submit button based on the form fields.
	 * The button is disabled if the title, description, or category is empty.
	 */
	useEffect(() => {
		setIsButtonDisabled(!title || !description || category === -1)
	}, [title, description, category])

	// Show loading spinner while categories are being fetched
	if (isLoading) {
		return (
			<Layout>
				<LoadingSpinner />
			</Layout>
		)
	}

	// Render the form once the categories have been loaded
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
							onChange={(e) => setTitle(e.target.value)}
							required
						/>
					</div>

					<div className="mb-4">
						<label
							htmlFor="description"
							className="block text-gray-700 font-semibold mb-2"
						>
							{t('description')}
						</label>
						<textarea
							id="description"
							className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							rows={4}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							required
						/>
					</div>

					<div className="mb-4">
						<label
							htmlFor="category"
							className="block text-gray-700 font-semibold mb-2"
						>
							{t('category')}
						</label>

						<select
							id="category"
							className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							value={category}
							onChange={(e) => setCategory(parseInt(e.target.value))}
							required
						>
							<option key={-1} value={-1}>
								{t('select-category')}
							</option>
							{data.map((item: Category) => (
								<option key={item.id} value={item.id}>
									{item.name}
								</option>
							))}
						</select>
					</div>

					<button
						disabled={isButtonDisabled}
						type="submit"
						className={`w-full py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
							isButtonDisabled
								? 'bg-gray-300 text-gray-500 cursor-not-allowed'
								: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500'
						}`}
					>
						{t('submit-post')}
					</button>
				</form>
			</main>
		</Layout>
	)
}
