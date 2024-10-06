import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { ReactQueryProvider } from './components/react-query-provider'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import SessionProvider from './components/session-provider'
import { getServerSession } from 'next-auth'

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
	title: 'Feature blog',
	description: 'Place for product managers to report features to product teams',
}

export default async function LocaleLayout({
	children,
	params: { locale },
}: {
	children: React.ReactNode
	params: { locale: string }
}) {
	// Providing all messages to the client
	// side is the easiest way to get started
	const messages = await getMessages()
	const session = await getServerSession()

	return (
		<html lang={locale}>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{' '}
				<SessionProvider session={session}>
					<NextIntlClientProvider messages={messages}>
						<ReactQueryProvider>{children}</ReactQueryProvider>
					</NextIntlClientProvider>
				</SessionProvider>
			</body>
		</html>
	)
}
