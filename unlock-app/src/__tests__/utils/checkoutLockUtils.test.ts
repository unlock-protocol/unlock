import { PaywallConfigType } from '@unlock-protocol/core'
import {
  lockKeysAvailable,
  lockTickerSymbol,
  userCanAffordKey,
  formattedKeyPrice,
  convertedKeyPrice,
  getReferrers,
} from '../../utils/checkoutLockUtils'
import { it, describe, expect, vi } from 'vitest'

const lockAddress = '0x2B24bE6c9d5b70Ad53203AdB780681cd70603660'
const network = 5

describe('Checkout Lock Utils', () => {
  describe('lockKeysAvailable', () => {
    it('returns Unlimited if it has unlimited keys', () => {
      expect.assertions(1)
      const lock = {
        unlimitedKeys: true,
        maxNumberOfKeys: -1,
        outstandingKeys: 100,
      }
      expect(lockKeysAvailable(lock)).toEqual('Unlimited')
    })

    it('returns the difference between max and outstanding ottherwise', () => {
      expect.assertions(1)
      const lock = {
        maxNumberOfKeys: 203,
        outstandingKeys: 100,
      }
      expect(lockKeysAvailable(lock)).toEqual('103')
    })
  })

  describe('lockTickerSymbol', () => {
    it('returns ETH when it is an ETH lock', () => {
      expect.assertions(1)
      const lock = {
        currencyContractAddress: null,
      }

      expect(lockTickerSymbol(lock, 'ETH')).toEqual('ETH')
    })

    it('returns DAI when it is a DAI lock', () => {
      expect.assertions(1)
      const lock = {
        currencyContractAddress: '0xDAI',
        currencySymbol: 'DAI',
      }

      expect(lockTickerSymbol(lock, 'ETH')).toEqual('DAI')
    })

    it('returns ERC20 when it is an unknown ERC20 lock', () => {
      expect.assertions(1)
      const lock = {
        currencyContractAddress: '0xDAI',
      }

      expect(lockTickerSymbol(lock, 'ETH')).toEqual('ERC20')
    })
  })

  describe('userCanAffordKey', () => {
    const balances = {
      eth: '50',
      '0x123abc': '50',
    }

    it('returns true when the user has enough eth', () => {
      expect.assertions(1)

      const lock = {
        keyPrice: '0.01',
        currencyContractAddress: null,
      }

      expect(userCanAffordKey(lock, '50')).toBeTruthy()
    })

    it('returns true when the user has enough erc20', () => {
      expect.assertions(1)

      const lock = {
        keyPrice: '0.01',
        currencyContractAddress: '0x123abc',
      }

      expect(userCanAffordKey(lock, '50')).toBeTruthy()
    })

    it('returns true when the user has exactly the right amount of erc20', () => {
      expect.assertions(1)

      const lock = {
        keyPrice: balances['0x123abc'],
        currencyContractAddress: '0x123abc',
      }

      expect(userCanAffordKey(lock, '50')).toBeTruthy()
    })

    it('returns false when the user has insufficient eth', () => {
      expect.assertions(1)

      const lock = {
        keyPrice: '100',
        currencyContractAddress: null,
      }

      expect(userCanAffordKey(lock, '50')).toBeFalsy()
    })

    it('returns false when the user has exactly the right amount of eth', () => {
      expect.assertions(1)

      const lock = {
        keyPrice: balances.eth,
        currencyContractAddress: null,
      }

      expect(userCanAffordKey(lock, '50')).toBeFalsy()
    })

    it('returns false when the user has insufficient erc20', () => {
      expect.assertions(1)

      const lock = {
        keyPrice: '100',
        currencyContractAddress: '0x123abc',
      }

      expect(userCanAffordKey(lock, '50')).toBeFalsy()
    })

    it('returns false when the key price cannot be parsed', () => {
      expect.assertions(1)

      const lock = {
        keyPrice: '100qq',
        currencyContractAddress: '0x123abc',
      }

      expect(userCanAffordKey(lock, '50')).toBeFalsy()
    })

    it('returns false when the balance cannot be parsed', () => {
      expect.assertions(1)

      const lock = {
        keyPrice: '100',
        currencyContractAddress: '0xnotintheobject',
      }

      expect(userCanAffordKey(lock, '50')).toBeFalsy()
    })

    it('correctly format keyPrice prices', () => {
      expect.assertions(2)
      const lock1 = {
        keyPrice: '100',
        currencyContractAddress: 'obc3',
        currencySymbol: 'eth',
        address: lockAddress,
        network,
      }
      const lock2 = {
        keyPrice: '0',
        currencyContractAddress: 'Oxbe',
        currencySymbol: 'eth',
        address: lockAddress,
        network,
      }

      expect(formattedKeyPrice(lock1, lock1.currencySymbol)).toEqual('100 ETH')

      expect(formattedKeyPrice(lock2, lock1.currencySymbol)).toEqual('FREE')
    })

    it('correctly format keyPrice based on numbersOfRecipients', () => {
      expect.assertions(2)
      const numbersOfRecipients = 3

      const lock1 = {
        keyPrice: '12.4',
        currencyContractAddress: 'obc3',
        currencySymbol: 'eth',
        address: lockAddress,
        network,
      }
      const lock2 = {
        keyPrice: '0',
        currencyContractAddress: 'Oxbe',
        currencySymbol: 'eth',
        address: lockAddress,
        network,
      }
      expect(
        formattedKeyPrice(lock1, lock1.currencySymbol, numbersOfRecipients)
      ).toEqual('37.2 ETH')

      expect(
        formattedKeyPrice(lock2, lock1.currencySymbol, numbersOfRecipients)
      ).toEqual('FREE')
    })

    // TODO: fix this test which is currently making a network request (network calls should be mocked)
    it.skip('correctly convert keyPrice', async () => {
      expect.assertions(2)
      const numbersOfRecipients = 6

      const lock = {
        fiatPricing: {
          usd: {
            amount: 20.22,
          },
        },
        address: lockAddress,
        network,
        currencyContractAddress: 'obc3',
        currencySymbol: 'eth',
      }

      expect(await convertedKeyPrice(lock)).toEqual('~$20.22')

      expect(await convertedKeyPrice(lock, numbersOfRecipients)).toEqual(
        '~$121.32'
      )
    })
  })

  describe('getReferrers', () => {
    const recipients = [
      '0x2B24bE6c9d5b70Ad53203AdB780681cd70603660',
      '0x1234567890123456789012345678901234567891',
    ]
    const lockAddress = '0x87dA72DC59674A17AD2154a25699246c51E25a57'
    let paywallConfig: PaywallConfigType

    beforeEach(() => {
      paywallConfig = {
        locks: {
          '0x87dA72DC59674A17AD2154a25699246c51E25a57': {
            referrer: '0x1234567890123456789012345678901234567890',
            network: 11155111,
          },
        },
        referrer: '0xE5Cd62AC8d2Ca2A62a04958f07Dd239c1Ffe1a9E',
      }
      vi.resetModules()
    })

    it('should return paywallConfig locks referrer', async () => {
      expect.assertions(1)
      expect(
        await getReferrers(recipients, paywallConfig, lockAddress)
      ).toEqual([
        '0x1234567890123456789012345678901234567890',
        '0x1234567890123456789012345678901234567890',
      ])
    })

    it('should return paywallConfig referrer', async () => {
      expect.assertions(1)
      paywallConfig = {
        ...paywallConfig,
        locks: {
          '0x87dA72DC59674A17AD2154a25699246c51E25a57': {
            referrer: '0x1234567890123',
          },
        },
      }

      expect(
        await getReferrers(recipients, paywallConfig, lockAddress)
      ).toEqual([
        '0xE5Cd62AC8d2Ca2A62a04958f07Dd239c1Ffe1a9E',
        '0xE5Cd62AC8d2Ca2A62a04958f07Dd239c1Ffe1a9E',
      ])
    })

    it('should return recipients if referrers are not addresses', async () => {
      expect.assertions(1)
      paywallConfig = {
        ...paywallConfig,
        locks: {
          '0x87dA72DC59674A17AD2154a25699246c51E25a57': {
            referrer: '0x1234567890123',
          },
        },
        referrer: '0x62CcB13A72E6F991',
      }

      expect(
        await getReferrers(recipients, paywallConfig, lockAddress)
      ).toEqual([
        '0x2B24bE6c9d5b70Ad53203AdB780681cd70603660',
        '0x1234567890123456789012345678901234567891',
      ])
    })

    it('should resolve for ens if the referrer is an ens address', async () => {
      vi.doMock('../../utils/resolvers', () => {
        return {
          onResolveName: () =>
            Promise.resolve({
              address: 'ensAddressMock',
            }),
        }
      })

      vi.doMock('@unlock-protocol/ui', () => {
        return {
          isEns: () => Promise.resolve(true),
        }
      })

      const { getReferrers } = await import('../../utils/checkoutLockUtils')
      expect.assertions(1)
      paywallConfig = {
        ...paywallConfig,
        locks: {
          '0x87dA72DC59674A17AD2154a25699246c51E25a57': {
            referrer: '0x1234567890123',
          },
        },
        referrer: 'test.eth',
      }

      expect(
        await getReferrers(recipients, paywallConfig, lockAddress)
      ).toEqual(['ensAddressMock', 'ensAddressMock'])

      vi.unmock('../../utils/resolvers')
      vi.unmock('@unlock-protocol/ui')
    })
  })
})
