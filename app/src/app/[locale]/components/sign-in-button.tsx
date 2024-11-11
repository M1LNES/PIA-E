'use client'

import { signIn } from 'next-auth/react'

/**
 * SignInButton Component
 *
 * This component renders a button that triggers the sign-in process when clicked. The `signIn` function
 * from NextAuth is called to initiate authentication. The button's label is customizable via the `label`
 * prop, allowing for dynamic button text.
 *
 * The button is styled with a blue background, which changes on hover, and displays bold white text.
 *
 * @param {string} label - The text to be displayed on the button.
 *
 * @returns {JSX.Element} The rendered sign-in button element.
 */
export default function SignInButton({ label }: { label: string }) {
	return (
		<button
			onClick={() => signIn()}
			className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
		>
			{label}
		</button>
	)
}
