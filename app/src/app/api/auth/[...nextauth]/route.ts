import NextAuth, { Account, NextAuthOptions, Profile } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { authorize, signIn } from '../../service/auth-service'
import config from '@/app/config'

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
			// Use the `authorize` function from the service
			async authorize(credentials) {
				if (credentials) {
					return authorize({
						email: credentials.email,
						password: credentials.password,
					})
				}
				return null
			},
		}),
	],
	// Define callback functions for additional logic during authentication flow
	callbacks: {
		// Use the `signIn` function from the service
		async signIn({ account, profile }) {
			return signIn({
				account: account as Account, // Explicitly type as Account
				profile: profile as Profile, // Explicitly type as Profile
			})
		},
	},
}

// Export handler for NextAuth routes
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
