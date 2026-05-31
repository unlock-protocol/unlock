import { describe, expect, it } from 'vitest'
import { getMessage, normalizeLocale } from '../../config/i18n'

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
})
