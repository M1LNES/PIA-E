'use client'
import { useState } from 'react'
import Layout from '../home/main-page-layout'
import { createCategory, fetchAllCategories } from '../services/data-service'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import LoadingSpinner from '../components/loading-spinner'

type Category = {
	name: string
	id: number
}

export default function CategoryCreator() {
	const t = useTranslations('pages.create-category')

	const [title, setTitle] = useState<string>('')
	const { data, isLoading } = useQuery({
		queryKey: ['categories'],
		queryFn: () => fetchAllCategories(),
	})

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()
		try {
			const result = await createCategory(title)
			if (result.status === 200) {
				alert('Category added successfully')
				window.location.reload()
			} else if (result.status === 409) {
				alert('This category already exists!')
			} else {
				alert('Error adding category')
			}
		} catch (error) {
			console.error('Error:', error)
			alert('Error adding category...')
		}
	}

	if (isLoading) {
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
								{data.map((item: Category) => (
									<tr key={item.id} className="hover:bg-gray-100">
										<td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
											{item.id}
										</td>
										<td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
											{item.name}
										</td>
									</tr>
								))}
							</tbody>
						</table>
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
