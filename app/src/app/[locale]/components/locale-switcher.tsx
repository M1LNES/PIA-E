'use client'

import { useLocale } from 'next-intl'
import { Locale } from '@/i18n/config'

export default function LocaleSwitcher() {
	return (
		<form className="flex gap-3">
			<LocaleButton locale="en" />
			<LocaleButton locale="cs" />
		</form>
	)
}

function LocaleButton({ locale }: { locale: Locale }) {
	const curLocale = useLocale()

	return (
		<button
			className={curLocale === locale ? 'underline' : undefined}
			name="locale"
			type="submit"
			value={locale}
			onClick={(e) => {
				e.preventDefault()
				window.location.pathname = `/${locale}` // ugly solution but the only one working
			}}
		>
			{locale.toUpperCase()}
		</button>
	)
}
