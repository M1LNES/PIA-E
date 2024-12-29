import { PUT as activationPUT } from '../src/app/api/users/activation/route'
import { PUT as deactivationPUT } from '../src/app/api/users/deactivation/route'

import { getServerSession } from 'next-auth'

// Mock next-auth
jest.mock('next-auth', () => ({
	getServerSession: jest.fn(),
}))

describe('API Endpoint: /api/users/deactivation', () => {
	it('Invalid session - should return 401', async () => {
		const req = new Request('http://localhost:3000/api/users/deactivation', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				emailAddress: 'integ@seznam.cz',
			}),
		})

		const response = await deactivationPUT(req)
		expect(response.status).toBe(401)
	})
	it('Invalid body - should return 400 when email is missing', async () => {
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

		const response = await deactivationPUT(req)
		expect(response.status).toBe(400)
	})
	it('Activate user that is disabled by default', async () => {
		// Mock session
		;(getServerSession as jest.Mock).mockResolvedValueOnce({
			user: { email: process.env.INTEGRATION_USER_MAIL },
		})

		const req = new Request('http://localhost:3000/api/users/deactivation', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				emailAddress: 'integ@seznam.cz',
			}),
		})

		const response = await deactivationPUT(req)
		expect(response.status).toBe(200)
	})
})

describe('API Endpoint: /api/users/activation', () => {
	it('Invalid session - should return 401', async () => {
		const req = new Request('http://localhost:3000/api/users/activation', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				emailAddress: 'integ@seznam.cz',
			}),
		})

		const response = await activationPUT(req)
		expect(response.status).toBe(401)
	})
	it('Invalid body - should return 400 when email is missing', async () => {
		;(getServerSession as jest.Mock).mockResolvedValueOnce({
			user: { email: process.env.INTEGRATION_USER_MAIL },
		})
		const req = new Request('http://localhost:3000/api/users/activation', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				chybi: 'Adresa',
			}),
		})

		const response = await activationPUT(req)
		expect(response.status).toBe(400)
	})
	it('Activate user that is disabled by default', async () => {
		// Mock session
		;(getServerSession as jest.Mock).mockResolvedValueOnce({
			user: { email: process.env.INTEGRATION_USER_MAIL },
		})

		const req = new Request('http://localhost:3000/api/users/activation', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				emailAddress: 'integ@seznam.cz',
			}),
		})

		const response = await activationPUT(req)
		expect(response.status).toBe(200)
	})
})
