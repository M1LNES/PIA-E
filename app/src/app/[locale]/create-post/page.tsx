'use client' // This is a client component 👈🏽
import { useState } from 'react'
import Layout from '../home/main-page-layout'
import { fetchAllCategories } from '../services/data-service'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'

interface Category {
	name: string
	id: number
}

export default function PostCreator() {
	const t = useTranslations('pages.create-post')

	const [title, setTitle] = useState<string>('')
	const [description, setDescription] = useState<string>('')
	const [category, setCategory] = useState<number>(-1)

	const { data, isLoading } = useQuery({
		queryKey: ['categories'],
		queryFn: () => fetchAllCategories(setCategory),
	})

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()

		const postData = { title, description, category }
		try {
			const response = await fetch('/api/posts/add-post', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(postData),
			})

			const result = await response.json()
			if (result.status === 200) {
				alert('Post added successfully')
			} else {
				alert('Error adding post')
			}
		} catch (error) {
			console.error('Error:', error)
			alert('Error adding post')
		}
	}

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
						{isLoading ? (
							<>{t('title')}</>
						) : (
							<select
								id="category"
								className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								value={category}
								onChange={(e) => setCategory(parseInt(e.target.value))}
								required
							>
								{data.map((item: Category) => (
									<option key={item.id} value={item.id}>
										{item.name}
									</option>
								))}
							</select>
						)}
					</div>

					<button
						type="submit"
						className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						{t('submit-post')}
					</button>
				</form>
			</main>
		</Layout>
	)
}
