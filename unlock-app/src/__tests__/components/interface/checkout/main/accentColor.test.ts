import { describe, expect, it } from 'vitest'
import { getCheckoutAccentColor } from '~/components/interface/checkout/main/accentColor'

describe('getCheckoutAccentColor', () => {
  it('returns a valid hex accent color', () => {
    expect(getCheckoutAccentColor(' #ff6771 ')).toBe('#ff6771')
    expect(getCheckoutAccentColor('#603DEB')).toBe('#603DEB')
    expect(getCheckoutAccentColor('#abc')).toBe('#abc')
  })

  it('ignores missing or invalid colors', () => {
    expect(getCheckoutAccentColor()).toBeUndefined()
    expect(getCheckoutAccentColor('red')).toBeUndefined()
    expect(getCheckoutAccentColor('var(--brand)')).toBeUndefined()
    expect(getCheckoutAccentColor('#ff6771; color: red')).toBeUndefined()
  })
})
