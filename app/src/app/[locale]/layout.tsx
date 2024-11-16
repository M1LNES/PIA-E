import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { ReactQueryProvider } from './components/react-query-provider'
import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import SessionProvider from './components/session-provider'
import { getServerSession } from 'next-auth'
import SessionGuard from './components/session-guard'
import EmojiCrying from './home/logos/emoji-crying'

const geistSans = localFont({
	src: './fonts/GeistVF.woff',
	variable: '--font-geist-sans',
	weight: '100 900',
})
const geistMono = localFont({
	src: './fonts/GeistMonoVF.woff',
	variable: '--font-geist-mono',
	weight: '100 900',
})

export const metadata: Metadata = {
	title: 'Emplifi Wishlist',
	description: 'Place for product owners to report features to product teams',
}

export default async function LocaleLayout({
	children,
	params: { locale },
}: {
	children: React.ReactNode
	params: { locale: string }
}) {
	let messages = null
	let session = null
	let errorMessage = null

	try {
		messages = await getMessages()
		session = await getServerSession()
	} catch {
		errorMessage =
			'Oops! Something went wrong while loading the page. Please try again later.'
	}

	// Invalid/unsupported locale specified in URL
	if (errorMessage) {
		return (
			<html lang={locale}>
				<body
					className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 text-gray-900`}
				>
					<div className="flex items-center justify-center min-h-screen">
						<div className="text-center">
							<div className="flex justify-center items-center h-24">
								<EmojiCrying />
							</div>

							<h1 className="text-3xl font-semibold text-gray-800">
								Oops! Something went wrong while loading the page.
							</h1>
							<p className="mt-4 text-lg text-gray-600">
								Please check the URL or try again later.
							</p>

							<a
								href="/"
								className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
							>
								Go back to Home
							</a>
						</div>
					</div>
				</body>
			</html>
		)
	}

	// Supported locale
	return (
		<html lang={locale}>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<SessionProvider session={session}>
					<NextIntlClientProvider
						locale={locale}
						messages={messages as AbstractIntlMessages}
					>
						<ReactQueryProvider>
							<SessionGuard>{children}</SessionGuard>
						</ReactQueryProvider>
					</NextIntlClientProvider>
				</SessionProvider>
			</body>
		</html>
	)
}
