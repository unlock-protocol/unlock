import v4 from '../v4'
import v6 from '../v6'
import v7 from '../v7'
import v8 from '../v8'
import WalletService from '../walletService'
import { GAS_AMOUNTS } from '../constants'

const supportedVersions = [v4, v6, v7, v8]

let walletService

describe('WalletService (ethers)', () => {
  beforeEach(() => {
    walletService = new WalletService()
  })

  describe('gasAmountConstants', () => {
    it('returns GAS_AMOUNTS', () => {
      expect.assertions(1)

      expect(WalletService.gasAmountConstants()).toBe(GAS_AMOUNTS)
    })
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

  describe('setKeyMetadata', () => {
    let originalFetch
    beforeAll(() => {
      originalFetch = window.fetch
    })
    beforeEach(async () => {
      window.fetch = jest.fn().mockResolvedValue({ status: 202 })
      walletService.getAccount = jest.fn().mockResolvedValue('0xuser')
      walletService.unformattedSignTypedData = jest
        .fn()
        .mockResolvedValue('aSignature')
    })
    afterAll(() => {
      window.fetch = originalFetch
    })

    const options = {
      lockAddress: '0xlockAddress',
      keyId: '1',
      metadata: {
        color: 'blue',
        bestBandNamedAfterAPlace: 'Chicago',
      },
      locksmithHost: 'https://locksmith',
    }

    it('sends the request to the correct URL', async (done) => {
      expect.assertions(3)

      const callback = (error, value) => {
        expect(error).toBeNull()
        expect(value).toBe(true)
        done()
      }

      await walletService.setKeyMetadata(options, callback)

      expect(window.fetch).toHaveBeenCalledWith(
        'https://locksmith/api/key/0xlockAddress/1',
        {
          method: 'PUT',
          headers: {
            Authorization: expect.any(String),
            'Content-Type': 'application/json',
          },
          body: expect.any(String),
        }
      )
    })

    it('calls back with an error if something goes wrong', async (done) => {
      expect.assertions(0)

      window.fetch = jest.fn().mockResolvedValue({ status: 503 })
      const callback = (error) => {
        if (error) {
          done()
        }
      }

      await walletService.setKeyMetadata(options, callback)
    })
  })

  describe('setUserMetadata', () => {
    let originalFetch
    beforeAll(() => {
      originalFetch = window.fetch
    })
    beforeEach(async () => {
      window.fetch = jest.fn().mockResolvedValue({ status: 202 })
      walletService.getAccount = jest.fn().mockResolvedValue('0xuser')
      walletService.unformattedSignTypedData = jest
        .fn()
        .mockResolvedValue('aSignature')
    })
    afterAll(() => {
      window.fetch = originalFetch
    })

    const options = {
      lockAddress: '0xlockAddress',
      userAddress: '0xuseraddress',
      metadata: {
        publicData: {},
        protectedData: {},
      },
      locksmithHost: 'https://locksmith',
    }

    it('sends the request to the correct URL', async (done) => {
      expect.assertions(3)

      const callback = (error, value) => {
        expect(error).toBeNull()
        expect(value).toBe(true)
        done()
      }

      await walletService.setUserMetadata(options, callback)

      expect(window.fetch).toHaveBeenCalledWith(
        'https://locksmith/api/key/0xlockAddress/user/0xuseraddress',
        {
          method: 'PUT',
          headers: {
            Authorization: expect.any(String),
            'Content-Type': 'application/json',
          },
          body: expect.any(String),
        }
      )
    })

    it('calls back with an error if something goes wrong', async (done) => {
      expect.assertions(0)

      window.fetch = jest.fn().mockResolvedValue({ status: 503 })
      const callback = (error) => {
        if (error) {
          done()
        }
      }

      await walletService.setUserMetadata(options, callback)
    })
  })

  describe('getKeyMetadata', () => {
    let originalFetch
    beforeAll(() => {
      originalFetch = window.fetch
    })
    beforeEach(async () => {
      window.fetch = jest
        .fn()
        .mockResolvedValue({ json: async () => ({ metadata: 'value' }) })
      walletService.getAccount = jest.fn().mockResolvedValue('0xuser')
      walletService.unformattedSignTypedData = jest
        .fn()
        .mockResolvedValue('aSignature')
    })
    afterAll(() => {
      window.fetch = originalFetch
    })

    const options = {
      lockAddress: '0xsomething',
      keyId: '1',
      locksmithHost: 'https://locksmith',
    }

    const expectedUrl = `${options.locksmithHost}/api/key/${options.lockAddress}/${options.keyId}`

    it('should callback with the json in the response on success', (done) => {
      expect.assertions(2)

      const callback = (error, value) => {
        expect(error).toBeNull()
        expect(value).toEqual({ metadata: 'value' })
        done()
      }

      walletService.getKeyMetadata(options, callback)
    })

    it('should callback with an error on error', (done) => {
      expect.assertions(2)

      window.fetch = jest.fn().mockRejectedValue('fail')

      const callback = (error, value) => {
        expect(value).toBeNull()
        expect(error).toEqual('fail')
        done()
      }

      walletService.getKeyMetadata(options, callback)
    })

    it('should not pass along a signature if getProtectedData is not specified', (done) => {
      expect.assertions(1)

      const callback = () => {
        expect(window.fetch).toHaveBeenCalledWith(expectedUrl, {
          method: 'GET',
          accept: 'json',
        })
        done()
      }

      walletService.getKeyMetadata(options, callback)
    })

    it('should pass along the signature if getProtectedData is specified', (done) => {
      expect.assertions(1)

      const callback = () => {
        expect(window.fetch).toHaveBeenCalledWith(expectedUrl, {
          method: 'GET',
          accept: 'json',
          Authorization: expect.any(String),
        })
        done()
      }

      walletService.getKeyMetadata(
        {
          ...options,
          getProtectedData: true,
        },
        callback
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
    it.each(supportedVersions)(
      'should implement all the required methods',
      (version) => {
        expect.assertions(4)
        versionSpecificUnlockMethods.forEach((method) => {
          expect(version[method]).toBeInstanceOf(Function)
        })
        versionSpecificLockMethods.forEach((method) => {
          expect(version[method]).toBeInstanceOf(Function)
        })
      }
    )
  })
})
