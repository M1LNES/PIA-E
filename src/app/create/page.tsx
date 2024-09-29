'use client' // This is a client component 👈🏽

import { useState } from 'react'
import Layout from '../main-page/main-page-layout'

export default function PostCreator() {
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [category, setCategory] = useState(1)

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()

		const postData = { title, description, category }
		try {
			const response = await fetch('/api/add-post', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(postData),
			})

			if (response.ok) {
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
				<h2 className="text-2xl font-semibold mb-6">Create a New Post</h2>
				<form
					onSubmit={handleSubmit}
					className="bg-white p-6 shadow-lg rounded-lg"
				>
					<div className="mb-4">
						<label
							htmlFor="title"
							className="block text-gray-700 font-semibold mb-2"
						>
							Short Title
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
							Description
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
							Category
						</label>
						<select
							id="category"
							className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							value={category}
							onChange={(e) => setCategory(parseInt(e.target.value))}
							required
						>
							<option value={1}>Omni Cast</option>
							<option value={2}>Omni API</option>
							<option value={3}>Omni Catalog</option>
						</select>
					</div>

					<button
						type="submit"
						className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						Submit Post
					</button>
				</form>
			</main>
		</Layout>
	)
}
