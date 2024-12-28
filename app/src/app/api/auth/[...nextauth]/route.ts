import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import {
	getAllActiveUsers,
	getUserByEmailAndNotDeleted,
} from '../../utils/queries'
import config from '@/app/config'

/**
 * NextAuth configuration options for session management and authentication providers.
 */
const authOptions: NextAuthOptions = {
	// Configure JWT session settings
	session: {
		strategy: 'jwt',
		maxAge: config.jwtTokenExpiration, // Sets maximum age for JWT session tokens
	},
	// Define authentication providers (Google and custom credentials)
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_ID ?? '',
			clientSecret: process.env.GOOGLE_SECRET ?? '',
		}),
		CredentialsProvider({
			name: 'Credentials',
			credentials: config.placeholder.credentials,
			/**
			 * Custom authorization function to verify user credentials.
			 * Checks if user exists and compares provided password to stored hash.
			 *
			 * @param {object} credentials - User credentials (email, password).
			 * @returns {object|null} - Authenticated user object or null if invalid.
			 */
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

				// Compare provided password with stored hashed password
				const arePasswordsSame = bcrypt.compareSync(
					password,
					row.hashed_password
				)
				return arePasswordsSame ? user : null
			},
		}),
	],
	// Define callback functions for additional logic during authentication flow
	callbacks: {
		/**
		 * Callback to control sign-in behavior.
		 * Allows Google sign-in if email is present in the database.
		 *
		 * @param {object} account - Account details of the sign-in attempt.
		 * @param {object} profile - Profile data from the provider.
		 * @returns {boolean} - True if sign-in is allowed, false otherwise.
		 */
		async signIn({ account, profile }) {
			if (account?.provider === 'credentials') {
				return true
			}

			if (account?.provider === 'google') {
				try {
					const users = await getAllActiveUsers()
					// Allow Google sign-in if user's email is in the database
					return users.some((user) => user.email === profile?.email)
				} catch {
					return false
				}
			}
			return false
		},
	},
}

// Export handler for NextAuth routes
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
