import { Author } from '../utils/test-interface'

export function getAuthors(): Author[] {
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

	return authors
}
