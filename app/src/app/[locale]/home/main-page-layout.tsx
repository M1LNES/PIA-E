'use client'
import { ReactNode } from 'react'
import { Link } from '@/i18n/routing'
import SlackLogo from './logos/slack-logo'
import GitLabLogo from './logos/gitlab-logo'
import EmplifiLogo from './logos/emplifi-logo'
import DocusaurusLogo from './logos/docusaurus-logo'
import LocaleSwitcher from '../components/locale-switcher'
import { useTranslations } from 'next-intl'
import { signOut } from 'next-auth/react'

interface LayoutProps {
	children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
	const t = useTranslations('navbar.menu-items')

	return (
		<div className="flex">
			<nav className="fixed top-0 left-0 h-screen w-1/6 bg-gray-800 text-white flex flex-col justify-between p-4">
				<div>
					<EmplifiLogo />
					<div className="border-t border-white my-4"></div>
					<ul>
						<li className="mb-2">
							<Link href="/" className="hover:text-gray-400">
								{t('home')}
							</Link>
						</li>
						<li className="mb-2">
							<Link href="/create-post" className="hover:text-gray-400">
								{t('create-post')}
							</Link>
						</li>
						<li className="mb-2">
							<Link href="/create-category" className="hover:text-gray-400">
								{t('create-category')}
							</Link>
						</li>
						<li className="mb-2">
							<Link href="/manage-users" className="hover:text-gray-400">
								{t('manage-users')}
							</Link>
						</li>
						<li className="mb-2">
							<Link href="/my-account" className="hover:text-gray-400">
								{t('my-account')}
							</Link>
						</li>
					</ul>
				</div>

				<div className="mt-auto">
					<div className="mb-4">
						<button
							className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-md"
							onClick={() => signOut()}
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
