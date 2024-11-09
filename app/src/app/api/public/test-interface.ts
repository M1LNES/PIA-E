import { NextRequest, NextResponse } from 'next/server'

export type Author = {
	name: string
	'e-mail': string
	birthplace: string
	github: string
}

export type Category = {
	id: number
	name: string
}

export type AppHandlerType = {
	GET: (req: NextRequest) => Promise<NextResponse>
}
