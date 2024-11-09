import { NextResponse } from 'next/server'
import { Author } from '../test-interface'
import { log } from '@/app/api/logger'

export async function GET() {
	const authors: Author[] = [
		{
			name: 'Skibidi Rizzler',
			birthplace: 'Ohio, Columbus',
			'e-mail': 'skibidi-ohio-kai-cenat@ohio.net',
			github: 'https://github.com/Gen-Alpha-Inc/skibidi-lang',
		},
		{
			name: 'Milan Janoch',
			birthplace: 'Pilsen, Czech Republic',
			'e-mail': 'milan.janoch@emplifi.io',
			github: 'https://github.com/M1LNES',
		},
	]

	log('info', 'GET api/public/authors', 'Authors fetched')

	return NextResponse.json(authors, { status: 200 })
}
