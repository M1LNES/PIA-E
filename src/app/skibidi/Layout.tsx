// components/Layout.tsx
import { ReactNode } from 'react'
import Link from 'next/link'
import SlackLogo from './logos/SlackLogo'
import GitLabLogo from './logos/GitLabLogo'
import EmplifiLogo from './logos/EmplifiLogo'

interface LayoutProps {
	children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
	return (
		<div className='flex min-h-screen'>
			{/* Left Navbar */}
			<nav className='w-1/6 bg-gray-800 text-white flex flex-col justify-between p-4'>
				{/* Upper Part with Links */}
				<div>
					<EmplifiLogo />
					<div className='border-t border-white my-4'></div>
					<ul>
						<li className='mb-2'>
							<Link href='#' className='hover:text-gray-400'>
								Home
							</Link>
						</li>
						<li className='mb-2'>
							<Link href='#' className='hover:text-gray-400'>
								About
							</Link>
						</li>
						<li className='mb-2'>
							<Link href='#' className='hover:text-gray-400'>
								Contact
							</Link>
						</li>
					</ul>
				</div>

				{/* Divider Line and Icons Below */}
				<div className='mt-auto'>
					{/* Divider Line */}
					<div className='border-t border-white my-4'></div>
					{/* Lower Part with Icons */}
					<div className='flex justify-center space-x-4'>
						<Link href='https://gitlab.com'>
							<GitLabLogo />
						</Link>
						<Link href='https://slack.com'>
							<SlackLogo />
						</Link>
						{/* Add more icons as needed */}
					</div>
				</div>
			</nav>

			{/* Main Content Area */}
			<main className='flex-grow bg-gray-100 p-6'>{children}</main>
		</div>
	)
}

export default Layout
