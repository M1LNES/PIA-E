'use client'

import { useQuery } from '@tanstack/react-query'
import {
	fetchAllPosts,
	fetchUserData,
	fetchCommentsByPostId,
	addComment,
} from '../services/data-service'
import LoadingSpinner from '../components/loading-spinner'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import config from '@/app/config'

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

interface Comment {
	comment_id: number
	author: number
	post: number
	description: string
	created_at: Date
	edited_at: Date
	deleted_at: Date
}

export default function HomePageClient() {
	const { data: session } = useSession()

	const { data: posts, isLoading } = useQuery({
		queryKey: ['posts'],
		queryFn: fetchAllPosts,
	})

	const { data: user, isLoading: isUserLoading } = useQuery({
		queryKey: ['userData', session?.user?.email],
		queryFn: () => fetchUserData(session?.user?.email as string),
		enabled: !!session?.user?.email,
	})

	const [showComments, setShowComments] = useState<Record<number, boolean>>({})
	const [newComments, setNewComments] = useState<Record<number, string>>({})

	const handleToggleComments = (postId: number) => {
		setShowComments((prev) => ({
			...prev,
			[postId]: !prev[postId],
		}))
	}

	const handleNewCommentChange = (
		e: React.ChangeEvent<HTMLTextAreaElement>,
		postId: number
	) => {
		setNewComments((prev) => ({
			...prev,
			[postId]: e.target.value,
		}))
	}

	const handleAddComment = async (postId: number) => {
		const postData = { postId, description: newComments[postId] }
		try {
			const result = await addComment(postData)
			if (result.status === 200) {
				alert('Comment added successfully')
				setNewComments((prev) => ({
					...prev,
					[postId]: '', // Clear the comment for this post after adding
				}))
			} else {
				alert('Error adding comment')
			}
		} catch (error) {
			console.error('Error:', error)
			alert('Error adding comment')
		}
	}

	const CommentsSection = ({ postId }: { postId: number }) => {
		const { data: comments = [], isLoading: isCommentsLoading } = useQuery({
			queryKey: ['comments', postId],
			queryFn: () => fetchCommentsByPostId(postId),
			enabled: showComments[postId],
		})

		if (isCommentsLoading) return <p>Loading comments...</p>
		if (!comments.length) return <p>No comments available.</p>

		return (
			<>
				{comments.map((comment: Comment) => (
					<p key={comment.comment_id}>
						<span className="font-semibold">User {comment.author}:</span>{' '}
						{comment.description}
					</p>
				))}
			</>
		)
	}

	if (isLoading || isUserLoading) {
		return <LoadingSpinner />
	}

	return (
		<>
			{posts.map((item: Post, index: number) => (
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

					<p className="text-base mb-4">{item.description}</p>

					{/* Button to toggle comments */}
					<button
						className="text-blue-500 underline text-sm"
						onClick={() => handleToggleComments(item.post_id)}
					>
						{showComments[item.post_id] ? 'Hide Comments' : 'Show Comments'}
					</button>

					{/* Comments section */}
					{showComments[item.post_id] && (
						<div className="mt-4 border-t pt-4">
							{showComments[item.post_id] && (
								<CommentsSection postId={item.post_id} />
							)}

							{user.permission >= config.pages.createPost.minPermission && (
								<>
									<textarea
										className="w-full border border-gray-300 rounded-md p-2 mb-2"
										rows={3}
										value={newComments[item.post_id] || ''}
										onChange={(e) => handleNewCommentChange(e, item.post_id)}
										placeholder="Write a comment..."
									></textarea>
									<button
										className="px-4 py-2 bg-blue-500 text-white rounded-md"
										onClick={() => handleAddComment(item.post_id)}
									>
										Add Comment
									</button>
								</>
							)}
						</div>
					)}
				</div>
			))}
		</>
	)
}
