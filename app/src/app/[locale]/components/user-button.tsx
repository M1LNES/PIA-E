import React from 'react'

interface ActionButtonProps {
	label: string
	color: 'red' | 'green'
	onClick: (event: React.FormEvent) => Promise<void>
}

const UserButton: React.FC<ActionButtonProps> = ({ label, color, onClick }) => {
	const bgColor =
		color === 'red'
			? 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
			: 'bg-green-500 hover:bg-green-600 focus:ring-green-500'

	return (
		<button
			type="button"
			className={`${bgColor} text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2`}
			onClick={onClick}
		>
			{label}
		</button>
	)
}

export default UserButton
