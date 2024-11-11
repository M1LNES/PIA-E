import React from 'react'

type ActionButtonProps = {
	label: string
	color: 'red' | 'green'
	onClick: (event: React.FormEvent) => Promise<void>
}

/**
 * UserButton Component
 *
 * This component renders a button with customizable text and color. The button's color is determined
 * by the `color` prop, which can be either 'red' or 'green'. When clicked, it triggers an asynchronous
 * action provided through the `onClick` prop.
 *
 * The button also applies a hover and focus effect based on the selected color, providing visual feedback
 * to the user during interaction.
 *
 * @param {string} label - The text to be displayed on the button.
 * @param {'red' | 'green'} color - The color scheme of the button. Can be either 'red' or 'green'.
 * @param {(event: React.FormEvent) => Promise<void>} onClick - The asynchronous function to be triggered
 *        when the button is clicked.
 *
 * @returns {JSX.Element} The rendered button element.
 */
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
