import { getPaywallConfigFromQuery } from '../../utils/paywallConfig'
import { it, describe, expect } from 'vitest'

const lock = '0x1234567890123456789012345678901234567890'
const validConfig = {
  title: 'Valid Title',
  network: 1,
  pessimistic: true,
  skipRecipient: false,
  locks: {
    [lock]: {
      name: 'A Lock',
    },
  },
  icon: 'http://image.com/image.tiff',
  minRecipients: 1,
  maxRecipients: 5,
}

describe('getPaywallConfigFromQuery', () => {
  it('should be undefined if there is no paywall config', () => {
    expect.assertions(1)
    expect(getPaywallConfigFromQuery({})).toBeUndefined()
  })

  it('should be undefined if paywall config is malformed JSON', () => {
    expect.assertions(1)
    expect(getPaywallConfigFromQuery({ paywallConfig: '{' })).toBeUndefined()
  })

  it('should be undefined if paywall config does not pass validation', () => {
    expect.assertions(1)
    expect(getPaywallConfigFromQuery({ paywallConfig: '{}' })).toBeUndefined()
  })

  it('should return a paywall config otherwise', () => {
    expect.assertions(1)
    expect(
      getPaywallConfigFromQuery({
        paywallConfig: JSON.stringify(validConfig),
      })
    ).toEqual(
      expect.objectContaining({
        icon: 'http://image.com/image.tiff',
        title: 'Valid Title',
        network: 1,
        pessimistic: true,
        skipRecipient: false,
        minRecipients: 1,
        maxRecipients: 5,
      })
    )
  })

  it('should preserve a valid accent color from the paywall config', () => {
    expect.assertions(1)
    expect(
      getPaywallConfigFromQuery({
        paywallConfig: JSON.stringify({
          ...validConfig,
          accentColor: '#F97316',
        }),
      })
    ).toEqual(
      expect.objectContaining({
        accentColor: '#F97316',
      })
    )
  })

  it('should reject an invalid accent color from the paywall config', () => {
    expect.assertions(1)
    expect(
      getPaywallConfigFromQuery({
        paywallConfig: JSON.stringify({
          ...validConfig,
          accentColor: 'orange',
        }),
      })
    ).toBeUndefined()
  })

  it('should handle ReadonlyURLSearchParams input', () => {
    expect.assertions(1)
    const searchParams = new URLSearchParams({ lock: '0x123', network: '1' })
    const result = getPaywallConfigFromQuery(searchParams)
    expect(result).toEqual({
      title: 'Unlock Protocol',
      network: 1,
      locks: {
        '0x123': {},
      },
    })
  })

  it('should include a valid accentColor from simple query parameters', () => {
    expect.assertions(1)
    const searchParams = new URLSearchParams({
      lock: '0x123',
      network: '1',
      accentColor: '#14B8A6',
    })
    const result = getPaywallConfigFromQuery(searchParams)
    expect(result).toEqual({
      title: 'Unlock Protocol',
      network: 1,
      accentColor: '#14B8A6',
      locks: {
        '0x123': {},
      },
    })
  })

  it('should include a short hex accentColor from simple query parameters', () => {
    expect.assertions(1)
    const searchParams = new URLSearchParams({
      lock: '0x123',
      network: '1',
      accentColor: '#fff',
    })
    const result = getPaywallConfigFromQuery(searchParams)
    expect(result).toEqual({
      title: 'Unlock Protocol',
      network: 1,
      accentColor: '#fff',
      locks: {
        '0x123': {},
      },
    })
  })

  it('should reject invalid accentColor from simple query parameters', () => {
    expect.assertions(1)
    const searchParams = new URLSearchParams({
      lock: '0x123',
      network: '1',
      accentColor: 'teal',
    })
    expect(getPaywallConfigFromQuery(searchParams)).toBeUndefined()
  })
})
