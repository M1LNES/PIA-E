import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import { getAllActiveUsers, getUserByEmailAndNotDeleted } from '../../queries'
import config from '@/app/config'

const authOptions: NextAuthOptions = {
	session: {
		strategy: 'jwt',
		maxAge: config.jwtTokenExpiration,
	},
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_ID ?? '',
			clientSecret: process.env.GOOGLE_SECRET ?? '',
		}),
		CredentialsProvider({
			name: 'Credentials',
			credentials: config.placeholder.credentials,
			async authorize(credentials) {
				if (!credentials) return null
				const { email, password } = credentials

				const row = await getUserByEmailAndNotDeleted(email)

				if (!row) {
					return null
				}

				const user = {
					id: row.id,
					name: row.username,
					email: row.email,
				}

				const arePasswordsSame = bcrypt.compareSync(
					password,
					row.hashed_password
				)
				return arePasswordsSame ? user : null
			},
		}),
	],
	callbacks: {
		async signIn({ account, profile }) {
			if (account?.provider === 'credentials') {
				return true
			}

			if (account?.provider === 'google') {
				try {
					const users = await getAllActiveUsers()
					return users.some((user) => user.email === profile?.email) // checking if user is in DB
				} catch {
					return false
				}
			}
			return false
		},
	},
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
