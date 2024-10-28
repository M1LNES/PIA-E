import Ably from 'ably'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export const revalidate = 0
export const fetchCache = 'force-no-store'
const client = new Ably.Rest(process.env.ABLY_API_KEY as string)

export async function GET() {
	const session = await getServerSession()
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	const tokenRequestData = await client.auth.createTokenRequest({
		clientId: 'ably-nextjs-demo',
	})
	return Response.json(tokenRequestData)
}
