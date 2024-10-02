'use client'

import { useLocale } from 'next-intl'
import { Locale } from '@/i18n/config'
import { Link } from '@/i18n/routing'

export default function LocaleSwitcher() {
	return (
		<div className="flex gap-3">
			<LocaleLink locale="en" />
			<LocaleLink locale="cs" />
		</div>
	)
}

function LocaleLink({ locale }: { locale: Locale }) {
	const curLocale = useLocale()

	return (
		<Link
			className={curLocale === locale ? 'underline' : undefined}
			href="/"
			locale={locale}
		>
			{locale.toUpperCase()}
		</Link>
	)
}
