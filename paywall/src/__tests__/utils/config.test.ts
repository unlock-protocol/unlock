import { PaywallConfig } from '../../unlockTypes'

import { normalizeConfig } from '../../utils/config'

describe('normalizeConfig', () => {
  type badConfigs = [string, any][]
  it.each(<badConfigs>[
    ['false', false],
    ['no locks', {}],
    ['locks is not an object', { locks: 5 }],
    ['locks is empty', { locks: {} }],
  ])('should return invalid config (%s) as-is', (_, badConfig) => {
    expect.assertions(1)

    expect(normalizeConfig(badConfig)).toBe(badConfig)
  })

  it('should normalize the lock addresses to lower-case', () => {
    expect.assertions(1)

    const config: PaywallConfig = {
      locks: {
        ABC: { name: 'hi' },
        def: { name: 'there' },
        AbQ: { name: 'foo' },
      },
      callToAction: {
        default: 'hi',
        expired: 'there',
        pending: 'pending',
        confirmed: 'confirmed',
        noWallet: 'no wallet',
      },
    }
    const normalizedConfig = {
      ...config,
      locks: {
        abc: { name: 'hi' },
        def: { name: 'there' },
        abq: { name: 'foo' },
      },
    }

    expect(normalizeConfig(config)).toEqual(normalizedConfig)
  })
})
