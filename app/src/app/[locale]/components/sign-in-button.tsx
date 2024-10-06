'use client'

import { signIn } from 'next-auth/react'

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
