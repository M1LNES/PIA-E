import { POST } from '../src/app/api/users/self/route'

import { getServerSession } from 'next-auth'

// Mock next-auth
jest.mock('next-auth', () => ({
	getServerSession: jest.fn(),
}))

describe('API Endpoint: POST /api/users/self', () => {
	it('Invalid session - should return 401', async () => {
		const req = new Request('http://localhost:3000/api/users/deactivation', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				emailAddress: 'integ@seznam.cz',
			}),
		})

		const response = await POST(req)
		expect(response.status).toBe(401)
	})
	it('Invalid body - should return 400 when e-mail is not provided in body', async () => {
		;(getServerSession as jest.Mock).mockResolvedValueOnce({
			user: { email: process.env.INTEGRATION_USER_MAIL },
		})
		const req = new Request('http://localhost:3000/api/users/deactivation', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				chybi: 'Adresa',
			}),
		})

		const response = await POST(req)
		expect(response.status).toBe(400)
	})

	it('Invalid permission - should return 403 when e-mail in body is different from the session one', async () => {
		;(getServerSession as jest.Mock).mockResolvedValueOnce({
			user: { email: process.env.INTEGRATION_USER_MAIL },
		})
		const req = new Request('http://localhost:3000/api/users/deactivation', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				emailAddress: 'nejakejmail@gmail.com',
			}),
		})

		const response = await POST(req)
		expect(response.status).toBe(403)
	})
	it('Activate user that is disabled by default', async () => {
		// Mock session
		;(getServerSession as jest.Mock).mockResolvedValueOnce({
			user: { email: process.env.INTEGRATION_USER_MAIL },
		})

		const req = new Request('http://localhost:3000/api/users/deactivation', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				emailAddress: process.env.INTEGRATION_USER_MAIL,
			}),
		})

		const response = await POST(req)
		expect(response.status).toBe(200)
	})
})
