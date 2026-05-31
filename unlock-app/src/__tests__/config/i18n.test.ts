import { describe, expect, it } from 'vitest'
import { getMessage, normalizeLocale } from '../../config/i18n'
import en from '../../config/i18n/locales/en.json'
import es from '../../config/i18n/locales/es.json'

const flattenKeys = (
  source: Record<string, unknown>,
  prefix = ''
): string[] => {
  return Object.entries(source).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return flattenKeys(value as Record<string, unknown>, path)
    }

    return path
  })
}

describe('i18n config', () => {
  it('normalizes supported locale tags', () => {
    expect.assertions(4)

    expect(normalizeLocale('es-MX')).toBe('es')
    expect(normalizeLocale('es-419')).toBe('es')
    expect(normalizeLocale('en-US')).toBe('en')
    expect(normalizeLocale('fr-FR')).toBeUndefined()
  })

  it('returns translated messages and falls back to English', () => {
    expect.assertions(3)

    expect(getMessage('es', 'header.connect')).toBe('Conectar')
    expect(getMessage('en', 'header.connect')).toBe('Connect')
    expect(getMessage('es', 'missing.key')).toBe('missing.key')
  })

  it('keeps English and Spanish dictionaries in sync', () => {
    expect.assertions(1)

    expect(flattenKeys(es).sort()).toEqual(flattenKeys(en).sort())
  })
})
