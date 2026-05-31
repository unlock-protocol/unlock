import { describe, expect, it } from 'vitest'
import { PaywallConfig } from '../schema'

describe('PaywallConfig schema', () => {
  const baseConfig = {
    locks: {
      '0x1234567890123456789012345678901234567890': {},
    },
  }

  it('accepts a checkout accent color', () => {
    expect.assertions(2)

    expect(
      PaywallConfig.safeParse({
        ...baseConfig,
        accentColor: '#603DEB',
      }).success
    ).toBe(true)
    expect(
      PaywallConfig.safeParse({
        ...baseConfig,
        accentColor: '#fff',
      }).success
    ).toBe(true)
  })

  it('rejects invalid checkout accent colors', () => {
    expect.assertions(2)

    expect(
      PaywallConfig.safeParse({
        ...baseConfig,
        accentColor: '603DEB',
      }).success
    ).toBe(false)
    expect(
      PaywallConfig.safeParse({
        ...baseConfig,
        accentColor: 'red',
      }).success
    ).toBe(false)
  })
})
