import { describe, expect, it } from 'vitest'
import { PaywallConfig } from '../schema'

describe('PaywallConfig schema', () => {
  const baseConfig = {
    locks: {
      '0x1234567890123456789012345678901234567890': {},
    },
  }

  it('accepts checkout hook URLs', () => {
    expect.assertions(1)

    expect(
      PaywallConfig.safeParse({
        ...baseConfig,
        hooks: {
          status: 'https://example.com/status',
          authenticated: 'https://example.com/authenticated',
          transactionSent: 'https://example.com/transaction',
          metadata: 'https://example.com/metadata',
        },
      }).success
    ).toBe(true)
  })

  it('rejects invalid checkout hook URLs', () => {
    expect.assertions(2)

    expect(
      PaywallConfig.safeParse({
        ...baseConfig,
        hooks: {
          status: 'not-a-url',
        },
      }).success
    ).toBe(false)
    expect(
      PaywallConfig.safeParse({
        ...baseConfig,
        hooks: {
          status: 'ftp://example.com/status',
        },
      }).success
    ).toBe(false)
  })
})
