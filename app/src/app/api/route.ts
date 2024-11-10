import { NextResponse } from 'next/server'
export async function GET() {
	return NextResponse.json(
		{
			message:
				'All endpoints thatt are supported by this API can be found in following url',
			url: 'https://pia-e-docs.vercel.app/api/about',
		},
		{ status: 200 }
	)
}
