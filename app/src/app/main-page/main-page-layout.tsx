// components/Layout.tsx
import { ReactNode } from 'react'
import Link from 'next/link'
import SlackLogo from './logos/slack-logo'
import GitLabLogo from './logos/gitlab-logo'
import EmplifiLogo from './logos/emplifi-logo'
import DocusaurusLogo from './logos/docusaurus-logo'

interface LayoutProps {
	children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
	return (
		<div className="flex min-h-screen">
			<nav className="w-1/6 bg-gray-800 text-white flex flex-col justify-between p-4">
				<div>
					<EmplifiLogo />
					<div className="border-t border-white my-4"></div>
					<ul>
						<li className="mb-2">
							<Link href="/" className="hover:text-gray-400">
								Home
							</Link>
						</li>
						<li className="mb-2">
							<Link href="/create" className="hover:text-gray-400">
								Create Post
							</Link>
						</li>
						<li className="mb-2">
							<Link href="/nic" className="hover:text-gray-400">
								Lorem Ipsum
							</Link>
						</li>
					</ul>
				</div>

				{/* Divider Line and Icons Below */}
				<div className="mt-auto">
					{/* Divider Line */}
					<div className="border-t border-white my-4"></div>
					{/* Lower Part with Icons */}
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
						{/* Add more icons as needed */}
					</div>
				</div>
			</nav>

			{/* Main Content Area */}
			<main className="flex-grow bg-gray-100 p-6">{children}</main>
		</div>
	)
}

export default Layout
