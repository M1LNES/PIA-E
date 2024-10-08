import { getServerSession } from 'next-auth'
import { ReactNode } from 'react'
import SignInButton from './sign-in-button'
import EmplifiLogo from '../home/logos/emplifi-logo'
import { getTranslations } from 'next-intl/server'

interface SessionGuardProps {
	children: ReactNode
}

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
