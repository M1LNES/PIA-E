import { sql } from '@vercel/postgres'
import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'

const authOptions: NextAuthOptions = {
	session: {
		strategy: 'jwt',
		maxAge: 1 * 24 * 60 * 60, // 1 day
	},
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_ID ?? '',
			clientSecret: process.env.GOOGLE_SECRET ?? '',
		}),
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: {
					label: 'Email',
					type: 'email',
					placeholder: 'shahar@emplifi.io',
				},
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials) return null
				const { email, password } = credentials

				const result =
					await sql`SELECT * FROM Users WHERE email = ${email} AND deleted_at IS NULL;`
				const row = result.rows

				const user = {
					id: row[0].id,
					name: row[0].username,
					email: row[0].email,
				}

				const arePasswordsSame = bcrypt.compareSync(
					password,
					row[0].hashed_password
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
					const result =
						await sql`SELECT * FROM Users WHERE deleted_at IS NULL;`
					const users = result.rows
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
