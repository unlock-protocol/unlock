import { describe, expect, it } from 'vitest'
import { PaywallConfig } from '../schema'

describe('PaywallConfig', () => {
  it('accepts a hex checkout accent color', () => {
    const config = PaywallConfig.parse({
      accentColor: '#603DEB',
      locks: {
        '0xlock': {},
      },
    })

    expect(config.accentColor).toBe('#603DEB')
  })

  it('rejects non-hex checkout accent colors', () => {
    expect(() =>
      PaywallConfig.parse({
        accentColor: 'var(--brand)',
        locks: {
          '0xlock': {},
        },
      })
    ).toThrow()
  })
})
