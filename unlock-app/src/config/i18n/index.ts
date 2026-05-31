import en from './locales/en.json'
import es from './locales/es.json'

export const supportedLocales = ['en', 'es'] as const
export type SupportedLocale = (typeof supportedLocales)[number]

export const defaultLocale: SupportedLocale = 'en'

export const localeLabels: Record<SupportedLocale, string> = {
  en: 'English',
  es: 'Español',
}

const dictionaries = {
  en,
  es,
}

const isSupportedLocale = (locale: string): locale is SupportedLocale => {
  return supportedLocales.includes(locale as SupportedLocale)
}

export const normalizeLocale = (
  locale?: string | null
): SupportedLocale | undefined => {
  if (!locale) {
    return undefined
  }

  const normalized = locale.toLowerCase().split('-')[0]
  return isSupportedLocale(normalized) ? normalized : undefined
}

const getNestedValue = (source: unknown, key: string): unknown => {
  return key.split('.').reduce<unknown>((current, part) => {
    if (current && typeof current === 'object' && part in current) {
      return (current as Record<string, unknown>)[part]
    }
    return undefined
  }, source)
}

export const getMessage = (locale: SupportedLocale, key: string): string => {
  const value =
    getNestedValue(dictionaries[locale], key) ??
    getNestedValue(dictionaries[defaultLocale], key)

  return typeof value === 'string' ? value : key
}
