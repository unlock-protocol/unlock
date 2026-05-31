'use client'

import { SupportedLocale, localeLabels, supportedLocales } from '~/config/i18n'
import { useLanguage, useTranslations } from '~/contexts/LanguageContext'

export const LanguageSwitcher = () => {
  const { locale, setLocale } = useLanguage()
  const t = useTranslations('header')

  return (
    <label className="flex items-center gap-2 text-sm font-medium text-ui-main-700">
      <span className="sr-only">{t('language')}</span>
      <select
        aria-label={t('language')}
        className="rounded-md border border-ui-main-300 bg-white px-2 py-1 text-sm"
        value={locale}
        onChange={(event) => {
          setLocale(event.target.value as SupportedLocale)
        }}
      >
        {supportedLocales.map((supportedLocale) => (
          <option key={supportedLocale} value={supportedLocale}>
            {localeLabels[supportedLocale]}
          </option>
        ))}
      </select>
    </label>
  )
}
