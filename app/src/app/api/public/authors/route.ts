import { NextResponse } from 'next/server'

export async function GET() {
	try {
		const authors = [
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
		return NextResponse.json(authors, { status: 200 })
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 })
	}
}
