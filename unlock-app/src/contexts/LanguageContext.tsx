'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  SupportedLocale,
  defaultLocale,
  getMessage,
  normalizeLocale,
} from '~/config/i18n'

interface LanguageContextValue {
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
)

const storageKey = 'unlock.locale'

const readSavedLocale = () => {
  try {
    return window.localStorage.getItem(storageKey)
  } catch {
    return null
  }
}

const saveLocale = (locale: SupportedLocale) => {
  try {
    window.localStorage.setItem(storageKey, locale)
  } catch {
    // Some browser privacy modes disable localStorage writes.
  }
}

const getInitialLocale = () => {
  if (typeof window === 'undefined') {
    return defaultLocale
  }

  const params = new URLSearchParams(window.location.search)
  return (
    normalizeLocale(params.get('lang')) ||
    normalizeLocale(params.get('locale')) ||
    normalizeLocale(readSavedLocale()) ||
    normalizeLocale(window.navigator.language) ||
    defaultLocale
  )
}

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(defaultLocale)

  useEffect(() => {
    setLocaleState(getInitialLocale())
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
    saveLocale(locale)
  }, [locale])

  const setLocale = useCallback((nextLocale: SupportedLocale) => {
    setLocaleState(nextLocale)
  }, [])

  const t = useCallback(
    (key: string) => {
      return getMessage(locale, key)
    },
    [locale]
  )

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t]
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }

  return context
}

export const useTranslations = (namespace?: string) => {
  const { t } = useLanguage()

  return useCallback(
    (key: string) => t(namespace ? `${namespace}.${key}` : key),
    [namespace, t]
  )
}
