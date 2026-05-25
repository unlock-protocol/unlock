import { describe, expect, it } from 'vitest'
import {
  getCheckoutAccentColor,
  getCheckoutAccentStyle,
} from '../../utils/checkoutTheme'

const validConfig = {
  locks: {
    '0x1234567890123456789012345678901234567890': {
      name: 'A Lock',
    },
  },
}

describe('checkoutTheme', () => {
  it('returns a supported accentColor', () => {
    expect(
      getCheckoutAccentColor({
        ...validConfig,
        accentColor: ' #1a2B3c ',
      })
    ).toBe('#1a2B3c')
  })

  it('accepts accentColour as an alias', () => {
    expect(
      getCheckoutAccentColor({
        ...validConfig,
        accentColour: '#abc',
      })
    ).toBe('#abc')
  })

  it('ignores unsupported colors', () => {
    expect(
      getCheckoutAccentColor({
        ...validConfig,
        accentColor: 'url(javascript:alert(1))',
      })
    ).toBeUndefined()
  })

  it('creates a scoped CSS variable style', () => {
    expect(getCheckoutAccentStyle('#1a2B3c')).toEqual({
      '--unlock-checkout-accent': '#1a2B3c',
    })
  })
})
