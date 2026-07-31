import {
  resolvePaywallConfigReferrers,
  resolveReferrer,
} from '../../utils/checkoutReferrers'

describe('checkout referrer resolution', () => {
  const address = '0x000000000000000000000000000000000000dEaD'

  it('keeps empty and address referrers without resolving names', async () => {
    const resolver = {
      resolveName: vi.fn(),
    }

    await expect(resolveReferrer(resolver)).resolves.toBeUndefined()
    await expect(resolveReferrer(resolver, address)).resolves.toBe(address)
    expect(resolver.resolveName).not.toHaveBeenCalled()
  })

  it('returns a resolved address for ENS referrers', async () => {
    const resolver = {
      resolveName: vi.fn().mockResolvedValue({ address }),
    }

    await expect(
      resolveReferrer(resolver, 'unlock-protocol.eth')
    ).resolves.toBe(address)
    expect(resolver.resolveName).toHaveBeenCalledWith('unlock-protocol.eth')
  })

  it('keeps the original ENS referrer when it cannot be resolved to an address', async () => {
    const resolver = {
      resolveName: vi.fn().mockResolvedValue({ address: 'not-an-address' }),
    }

    await expect(resolveReferrer(resolver, 'missing.eth')).resolves.toBe(
      'missing.eth'
    )
  })

  it('keeps the original ENS referrer when the resolver fails', async () => {
    const resolver = {
      resolveName: vi.fn().mockRejectedValue(new Error('resolver unavailable')),
    }

    await expect(resolveReferrer(resolver, 'missing.eth')).resolves.toBe(
      'missing.eth'
    )
  })

  it('resolves top-level and lock-specific paywall config referrers', async () => {
    const lockAddress = '0x1111111111111111111111111111111111111111'
    const lockReferrer = '0x2222222222222222222222222222222222222222'
    const resolver = {
      resolveName: vi
        .fn()
        .mockResolvedValueOnce({ address: lockReferrer })
        .mockResolvedValueOnce({ address }),
    }

    const config = {
      referrer: 'unlock-protocol.eth',
      locks: {
        [lockAddress]: {
          name: 'Test lock',
          network: 1,
          referrer: 'lock-referrer.eth',
        },
      },
    }

    await expect(
      resolvePaywallConfigReferrers(config, resolver)
    ).resolves.toMatchObject({
      referrer: address,
      locks: {
        [lockAddress]: {
          referrer: lockReferrer,
        },
      },
    })
  })
})
