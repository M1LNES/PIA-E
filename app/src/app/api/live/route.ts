import Ably from 'ably'

export const revalidate = 0
export const fetchCache = 'force-no-store'
const client = new Ably.Rest(process.env.ABLY_API_KEY as string)

export async function GET(request) {
	const tokenRequestData = await client.auth.createTokenRequest({
		clientId: 'ably-nextjs-demo',
	})
	return Response.json(tokenRequestData)
}
