'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchAllPosts } from '../services/data-service'

interface Post {
	username: string
	role_type: string
	post_id: number
	title: string
	description: string
	created_at: Date
	edited_at: Date
	category_name: string
}

export default function HomePageClient() {
	const { data: posts, isLoading } = useQuery({
		queryKey: ['posts'],
		queryFn: fetchAllPosts,
	})

	return (
		<>
			{isLoading ? (
				<>Loading posts</>
			) : (
				posts.map((item: Post, index: number) => (
					<div
						key={index}
						className="p-4 mb-4 bg-white shadow-lg rounded-md border border-gray-200"
					>
						<div className="flex justify-between items-center mb-2">
							<div className="text-2xl font-bold">
								[{item.category_name}] - {item.title}
							</div>
							<div className="text-gray-500 text-sm">
								{new Date(item.created_at).toLocaleDateString()}{' '}
								{new Date(item.created_at).toLocaleTimeString()}{' '}
							</div>
						</div>

						<div className="text-gray-600 text-sm mb-4">
							{item.username} - {item.role_type}
						</div>

						<p className="text-base">{item.description}</p>
					</div>
				))
			)}
		</>
	)
}
