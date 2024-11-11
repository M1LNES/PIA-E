'use client'

import { useLocale } from 'next-intl'
import { Locale } from '@/i18n/config'
import { Link } from '@/i18n/routing'

/**
 * `LocaleSwitcher` displays buttons to switch between available locales.
 * It renders the language options "en" (English) and "cs" (Czech) and highlights
 * the current locale with an underline.
 *
 * @returns {JSX.Element} - A component with buttons for changing locale.
 */
export default function LocaleSwitcher() {
	return (
		<div className="flex gap-3">
			<LocaleLink locale="en" />
			<LocaleLink locale="cs" />
		</div>
	)
}

/**
 * `LocaleLink` renders a link to switch the locale. The link will be underlined if it
 * matches the current locale.
 *
 * @param {Object} props - The component props.
 * @param {Locale} props.locale - The locale to switch to.
 * @returns {JSX.Element} - A link element that switches the locale.
 */
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
