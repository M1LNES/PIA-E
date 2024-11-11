import { getServerSession } from 'next-auth'
import { ReactNode } from 'react'
import SignInButton from './sign-in-button'
import EmplifiLogo from '../home/logos/emplifi-logo'
import { getTranslations } from 'next-intl/server'

type SessionGuardProps = {
	children: ReactNode
}

/**
 * `SessionGuard` is a component that ensures users are authenticated before accessing the wrapped content.
 * If the user is not signed in, it displays a login screen with a title, description, and a sign-in button.
 *
 * @param {ReactNode} children - The content to render if the user is authenticated.
 * @returns {JSX.Element} - A login screen or the wrapped content based on authentication.
 */

export default async function SessionGuard({ children }: SessionGuardProps) {
	const session = await getServerSession()
	const t = await getTranslations('pages.log-in')
	if (!session) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
				<div className="flex flex-col items-center justify-center">
					<div className=" w-1/4">
						<EmplifiLogo />
					</div>

					<div className="bg-white p-8 rounded-lg shadow-lg max-w-lg text-center">
						<h1 className="text-3xl font-bold text-gray-800 mb-4">
							{t('title')}
						</h1>
						<p className="text-gray-600 mb-6">{t('description')}</p>

						<div>
							<SignInButton label={t('sign-in')} />
						</div>
					</div>
				</div>
			</div>
		)
	}

	return <>{children}</>
}
