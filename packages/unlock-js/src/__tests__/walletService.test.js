/* eslint jest/no-identical-title: 0 */
import WalletService from '../walletService'

import PublicLockVersions from '../PublicLock'
import UnlockVersions from '../Unlock'

let walletService

describe('WalletService (ethers)', () => {
  beforeEach(() => {
    walletService = new WalletService({})
  })

  describe('unformattedSignTypedData', () => {
    const userAddress = '0x123'
    const data = { hello: 'world' }
    it('should try several method and return the result of the first one which succeeds', async () => {
      expect.assertions(2)
      const signature = 'signature'
      walletService.provider = {
        send: jest.fn((method) => {
          if (method === 'eth_signTypedData') {
            return Promise.reject(new Error())
          }
          return Promise.resolve(signature)
        }),
      }
      const result = await walletService.unformattedSignTypedData(
        userAddress,
        data
      )
      expect(walletService.provider.send).toHaveBeenCalledTimes(2)
      expect(result).toEqual(signature)
    })
    it('should fail if all methods fail', async () => {
      expect.assertions(5)
      walletService.provider = {
        send: jest.fn(() => {
          return Promise.reject(new Error())
        }),
      }
      try {
        await walletService.unformattedSignTypedData(userAddress, data)
      } catch (error) {
        expect(true).toBe(true) // This should have been called as unformattedSignTypedData fails
      }
      expect(walletService.provider.send).toHaveBeenCalledTimes(3)
      expect(walletService.provider.send).toHaveBeenNthCalledWith(
        1,
        'eth_signTypedData',
        ['0x123', { hello: 'world' }]
      )
      expect(walletService.provider.send).toHaveBeenNthCalledWith(
        2,
        'eth_signTypedData_v3',
        ['0x123', '{"hello":"world"}']
      )
      expect(walletService.provider.send).toHaveBeenNthCalledWith(
        3,
        'eth_signTypedData_v4',
        ['0x123', '{"hello":"world"}']
      )
    })
  })

  describe('versions', () => {
    const versionSpecificUnlockMethods = ['createLock']

    it.each(versionSpecificUnlockMethods)(
      'should invoke the implementation of the corresponding version of %s',
      async (method) => {
        expect.assertions(3)
        const args = []
        const result = {}
        const version = {
          [method](_args) {
            // Needs to be a function because it is bound to walletService
            expect(this).toBe(walletService)
            expect(_args).toBe(...args)
            return result
          },
        }
        walletService.unlockContractAbiVersion = jest.fn(() => version)
        const r = await walletService[method](...args)
        expect(r).toBe(result)
      }
    )

    const versionSpecificLockMethods = [
      'purchaseKey',
      'withdrawFromLock',
      'updateKeyPrice',
    ]

    it.each(versionSpecificLockMethods)(
      'should invoke the implementation of the corresponding version of %s',
      async (method) => {
        expect.assertions(3)
        const args = [
          {
            lockAddress: '0x123',
          },
        ]
        const result = {}
        const version = {
          [method](_args) {
            // Needs to be a function because it is bound to walletService
            expect(this).toBe(walletService)
            expect(_args).toBe(...args)
            return result
          },
        }
        walletService.lockContractAbiVersion = jest.fn(() => version)
        const r = await walletService[method](...args)
        expect(r).toBe(result)
      }
    )

    // for each supported version, let's make sure it implements all methods
    describe('version-specific methods', () => {
      it.each(Object.keys(UnlockVersions))(
        'should implement all the required methods',
        (versionNumber) => {
          expect.assertions(1)
          const version = UnlockVersions[versionNumber]
          versionSpecificUnlockMethods.forEach((method) => {
            expect(version[method]).toBeInstanceOf(Function)
          })
        }
      )

      it.each(Object.keys(PublicLockVersions))(
        'should implement all the required methods',
        (versionNumber) => {
          expect.assertions(3)
          const version = PublicLockVersions[versionNumber]
          versionSpecificLockMethods.forEach((method) => {
            expect(version[method]).toBeInstanceOf(Function)
          })
        }
      )
    })
  })
})
