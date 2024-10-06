import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
// import CredentialsProvider from 'next-auth/providers/credentials'

const authOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_ID ?? '',
			clientSecret: process.env.GOOGLE_SECRET ?? '',
		}),
		// CredentialsProvider({
		// 	name: 'Credentials',
		// 	credentials: {
		// 		email: { label: 'Email', type: 'email' },
		// 		password: { label: 'Password', type: 'password' },
		// 	},
		// 	async authorize(credentials) {
		// 		// Add logic to verify credentials here
		// 		if (!credentials) return null
		// 		const { email, password } = credentials
		// 		// Fetch user and password hash from your database
		// 		// Example: const user = await getUserByEmail(email)
		// 		if (user && bcrypt.compareSync(password, user.passwordHash)) {
		// 			return { id: user.id, name: user.name, email: user.email }
		// 		} else {
		// 			throw new Error('Invalid credentials')
		// 		}
		// 	},
		// }),
	],
}

export const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
