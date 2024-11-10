'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
	fetchAllPosts,
	fetchUserData,
	fetchCommentsByPostId,
	addComment,
} from '../services/data-service'
import LoadingSpinner from '../components/loading-spinner'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import config from '@/app/config'
import { useTranslations } from 'next-intl'
import Ably from 'ably'

type Post = {
	username: string
	role_type: string
	post_id: number
	title: string
	description: string
	created_at: Date
	edited_at: Date
	category_name: string
	comment_count: number
}

type Comment = {
	id: number
	author: number
	post: number
	description: string
	created_at: Date
	username: string
}

export default function HomePageClient() {
	const { data: session } = useSession()
	const t = useTranslations('pages.home')
	const queryClient = useQueryClient()

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
	const [isAddingComment, setIsAddingComment] = useState<
		Record<number, boolean>
	>({})
	const [typingUsers, setTypingUsers] = useState<Record<number, Set<string>>>(
		{}
	)
	const [ably, setAbly] = useState<Ably.Realtime | null>(null)
	const [meTyping, setMeTyping] = useState<boolean>(false)

	useEffect(() => {
		const client = new Ably.Realtime({ authUrl: '/api/live' })
		setAbly(client)
	}, [])

	const sendTypingNotification = (postId: number) => {
		if (ably) {
			const channel = ably.channels.get(`post-comments-${postId}`)
			channel.publish('typing', { username: user.username, postId })
			setMeTyping(true)
			setTimeout(() => setMeTyping(false), config.typingDurationForResend)
		}
	}

	const handleToggleComments = (postId: number) => {
		setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }))
		queryClient.invalidateQueries({ queryKey: ['comments', postId] })
	}

	const handleNewCommentChange = (
		e: React.ChangeEvent<HTMLTextAreaElement>,
		postId: number
	) => {
		setNewComments((prev) => ({ ...prev, [postId]: e.target.value }))
		if (!meTyping) {
			sendTypingNotification(postId) // Notify server
		}
	}

	const handleAddComment = async (postId: number) => {
		setIsAddingComment((prev) => ({ ...prev, [postId]: true }))

		const postData = { postId, description: newComments[postId] }
		try {
			const result = await addComment(postData)
			if (result.status === 200) {
				setNewComments((prev) => ({ ...prev, [postId]: '' }))

				const channel = ably?.channels.get(`post-comments-${postId}`)
				channel?.publish('new-comment', result.comment)

				// Refresh comments locally
				queryClient.invalidateQueries({ queryKey: ['comments', postId] })
			} else {
				alert('Error adding comment')
			}
		} catch (error) {
			console.error('Error:', error)
			alert('Error adding comment')
		} finally {
			setIsAddingComment((prev) => ({ ...prev, [postId]: false }))
		}
	}

	const CommentsSection = ({ postId }: { postId: number }) => {
		const { data: comments = [], isLoading: isCommentsLoading } = useQuery({
			queryKey: ['comments', postId],
			queryFn: () => fetchCommentsByPostId(postId),
			enabled: showComments[postId],
			staleTime: config.pages.home.commentStaleTime,
		})

		useEffect(() => {
			// Subscribe to Ably channel when comments are shown
			if (ably) {
				const channel = ably.channels.get(`post-comments-${postId}`)
				// Listen for new comments
				channel.subscribe('new-comment', (message) => {
					queryClient.setQueryData(
						['comments', postId],
						(oldData: Comment[] | undefined) => [
							...(oldData || []),
							message.data,
						]
					)
					queryClient.invalidateQueries({ queryKey: ['posts'] })

					// Remove that user from typing users
					const { username } = message.data
					setTypingUsers((prev) => {
						const users = prev[postId]
						if (users) {
							users.delete(username)
							if (users.size === 0) {
								const newTypingUsers = { ...prev }
								delete newTypingUsers[postId]
								return newTypingUsers
							}
						}
						return prev
					})
				})

				channel.subscribe('typing', (message) => {
					const { username } = message.data
					if (username !== user.username) {
						// Only add if it's not the current user's username
						setTypingUsers((prev) => {
							const users = prev[postId] || new Set()
							users.add(username)
							return { ...prev, [postId]: users }
						})

						// Remove typing user after a certain period
						setTimeout(() => {
							setTypingUsers((prev) => {
								const users = prev[postId]
								if (users) {
									users.delete(username)
									if (users.size === 0) {
										const newTypingUsers = { ...prev }
										delete newTypingUsers[postId]
										return newTypingUsers
									}
								}
								return prev
							})
						}, config.typingTextDuration) // Adjust the timeout as necessary
					}
				})

				// Cleanup on component unmount
				return () => channel.unsubscribe()
			}
		}, [postId])

		if (isCommentsLoading) return <p>{t('comments.loading') as string}</p>
		if (!comments.length) return <p>{t('comments.no-comments') as string}</p>

		return (
			<div className="mt-4 space-y-4 mb-4">
				{comments.map((comment: Comment) => (
					<div
						key={comment.id}
						className={`p-3 border rounded-md shadow-sm ${
							comment.created_at
								? 'border-gray-200 bg-gray-50'
								: 'border-green-400 bg-green-100'
						}`}
					>
						{comment.created_at === null && (
							<span className="text-green-600 font-semibold">
								<p>{t('comments.new-comment') as string}</p>
							</span>
						)}
						{/* Comment rendering */}
						<div className="flex justify-between items-center mb-1">
							<div className="font-semibold text-blue-600">
								{comment.username}
							</div>
							<div className="text-gray-500 text-xs">
								{comment.created_at ? (
									`${new Date(
										comment.created_at
									).toLocaleDateString()} ${new Date(
										comment.created_at
									).toLocaleTimeString()}`
								) : (
									<p>{t('comments.just-now') as string}</p>
								)}
							</div>
						</div>
						<p className="text-gray-700 text-sm">{comment.description}</p>
					</div>
				))}
			</div>
		)
	}

	if (isLoading || isUserLoading) return <LoadingSpinner />

	return (
		<>
			{posts.map((item: Post, index: number) => (
				<div
					key={index}
					className="p-4 mb-4 bg-white shadow-lg rounded-md border border-gray-200"
				>
					{/* Post rendering */}
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

					{/* Comments toggle */}
					<div className="text-gray-600 text-sm mb-4">
						<button
							className="text-blue-500 underline text-sm"
							onClick={() => handleToggleComments(item.post_id)}
						>
							{showComments[item.post_id]
								? t('comments.hide-comments')
								: t('comments.show-comments')}
						</button>
						({item.comment_count})
					</div>

					{/* Comments section */}
					{showComments[item.post_id] && (
						<div className="mt-4 border-t pt-4">
							<CommentsSection postId={item.post_id} />
							{typingUsers[item.post_id]?.size > 0 && (
								<div className="text-gray-500 text-sm">
									{Array.from(typingUsers[item.post_id]).join(', ')}{' '}
									{t('comments.typing')}
								</div>
							)}
							{user.permission >= config.pages.createPost.minPermission && (
								<>
									<textarea
										className="w-full border border-gray-300 rounded-md p-2 mb-2"
										rows={3}
										value={newComments[item.post_id] || ''}
										onChange={(e) => handleNewCommentChange(e, item.post_id)}
										placeholder={t('comments.write-comment')}
									></textarea>
									<button
										className={`px-4 py-2 rounded-md text-white 
													${
														!newComments[item.post_id] ||
														isAddingComment[item.post_id]
															? 'bg-gray-300 text-gray-500 cursor-not-allowed'
															: 'bg-blue-500 hover:bg-blue-600'
													}`}
										onClick={() => handleAddComment(item.post_id)}
										disabled={
											!newComments[item.post_id] ||
											isAddingComment[item.post_id]
										}
									>
										{isAddingComment[item.post_id]
											? t('comments.adding-comment')
											: t('comments.add-comment')}
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
