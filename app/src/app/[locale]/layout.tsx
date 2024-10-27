import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { ReactQueryProvider } from './components/react-query-provider'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import SessionProvider from './components/session-provider'
import { getServerSession } from 'next-auth'
import SessionGuard from './components/session-guard'

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
	const messages = await getMessages()
	const session = await getServerSession()

	return (
		<html lang={locale}>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<SessionProvider session={session}>
					<NextIntlClientProvider locale={locale} messages={messages}>
						<ReactQueryProvider>
							<SessionGuard>{children}</SessionGuard>
						</ReactQueryProvider>
					</NextIntlClientProvider>
				</SessionProvider>
			</body>
		</html>
	)
}
