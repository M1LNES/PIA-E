'use client'
import { ReactNode } from 'react'
import { Link } from '@/i18n/routing'
import SlackLogo from './logos/slack-logo'
import GitLabLogo from './logos/gitlab-logo'
import EmplifiLogo from './logos/emplifi-logo'
import DocusaurusLogo from './logos/docusaurus-logo'
import LocaleSwitcher from '../components/locale-switcher'
import { useTranslations } from 'next-intl'
import { signOut, useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { fetchUserData } from '../services/data-service'
import config from '@/app/config'

interface LayoutProps {
	children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
	const { data: session } = useSession()

	const { data: user, isLoading } = useQuery({
		queryKey: ['userData', session?.user?.email],
		queryFn: () => fetchUserData(session?.user?.email as string),
		enabled: !!session?.user?.email,
	})

	const t = useTranslations('navbar.menu-items')

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900"></div>
			</div>
		)
	}
	return (
		<div className="flex">
			<nav className="fixed top-0 left-0 h-screen w-1/6 bg-gray-800 text-white flex flex-col justify-between p-4">
				<div>
					<EmplifiLogo />
					<div className="border-t border-white my-4"></div>
					<ul>
						{user.permission >= config.pages.home.minPermission && (
							<li className="mb-2">
								<Link href="/" className="hover:text-gray-400">
									{t('home')}
								</Link>
							</li>
						)}

						{user.permission >= config.pages.myAccount.minPermission && (
							<li className="mb-2">
								<Link href="/my-account" className="hover:text-gray-400">
									{t('my-account')}
								</Link>
							</li>
						)}

						{user.permission >= config.pages.createPost.minPermission && (
							<li className="mb-2">
								<Link href="/create-post" className="hover:text-gray-400">
									{t('create-post')}
								</Link>
							</li>
						)}

						{user.permission >= config.pages.createCategory.minPermission && (
							<li className="mb-2">
								<Link href="/create-category" className="hover:text-gray-400">
									{t('create-category')}
								</Link>
							</li>
						)}

						{user.permission >= config.pages.manageUsers.minPermission && (
							<li className="mb-2">
								<Link href="/manage-users" className="hover:text-gray-400">
									{t('manage-users')}
								</Link>
							</li>
						)}
					</ul>
				</div>

				<div className="mt-auto">
					<div className="mb-4">
						<button
							className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-md"
							onClick={() => signOut({ callbackUrl: '/', redirect: true })}
						>
							{t('sign-out')}
						</button>
					</div>

					<div className="border-t border-white my-4"></div>

					{/* Social Media Links */}
					<div className="flex justify-center space-x-4">
						<Link href="https://gitlab.com">
							<GitLabLogo />
						</Link>
						<Link href="https://slack.com">
							<SlackLogo />
						</Link>
						<Link href="https://pia-e-docs.vercel.app/">
							<DocusaurusLogo />
						</Link>
					</div>
					<div className="border-t border-white my-4"></div>
					<div className="flex justify-center space-x-4">
						<LocaleSwitcher />
					</div>
				</div>
			</nav>

			<main
				className="flex-grow bg-gray-100 p-6 ml-4"
				style={{ paddingLeft: '16.6667%' }}
			>
				{children}
			</main>
		</div>
	)
}

export default Layout
