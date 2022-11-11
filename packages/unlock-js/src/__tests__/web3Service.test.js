import Web3Service from '../web3Service'

import PublicLockVersions from '../PublicLock'

const host = process.env.CI ? 'eth-node' : '127.0.0.1'
const port = 8545
const provider = `http://${host}:${port}`

const networks = {
  31337: {
    provider,
    unlockAddress: '0xc43efE2C7116CB94d563b5A9D68F260CCc44256F',
  },
}

let web3Service

jest.mock('../erc20.ts', () => {
  return {
    getErc20Decimals: jest.fn(() => Promise.resolve(18)),
    getErc20BalanceForAddress: jest.fn(() => Promise.resolve('0x0')),
  }
})

describe('Web3Service', () => {
  beforeEach(() => {
    web3Service = new Web3Service(networks)
  })

  describe('versions', () => {
    const versionSpecificLockMethods = ['getLock']

    it.each(versionSpecificLockMethods)(
      'should invoke the implementation of the corresponding version of %s',
      async (method) => {
        expect.assertions(3)
        const args = ['0xlock', 31337]
        const result = {}
        const version = {
          [method](_args) {
            // Needs to be a function because it is bound to web3Service
            expect(this).toBe(web3Service)
            expect(_args).toBe(...args)
            return result
          },
        }
        web3Service.lockContractAbiVersion = jest.fn(() => version)
        const r = await web3Service[method](...args)
        expect(r).toBe(result)
      }
    )

    // for each supported version, let's make sure it implements all methods
    it.each(Object.keys(PublicLockVersions))(
      'should implement all the required methods',
      (versionNumber) => {
        expect.assertions(1)
        const version = PublicLockVersions[versionNumber]
        versionSpecificLockMethods.forEach((method) => {
          expect(version[method]).toBeInstanceOf(Function)
        })
      }
    )
  })

  describe('recoverAccountFromSignedData', () => {
    it('returns the signing address', async () => {
      expect.hasAssertions()

      const data = 'hello world'
      const account = '0x14791697260E4c9A71f18484C9f997B308e59325'
      const signature =
        '0xddd0a7290af9526056b4e35a077b9a11b513aa0028ec6c9880948544508f3c63' +
        '265e99e47ad31bb2cab9646c504576b3abc6939a1710afc08cbf3034d73214b8' +
        '1c'

      const returnedAddress = await web3Service.recoverAccountFromSignedData(
        data,
        signature
      )

      expect(returnedAddress).toBe(account)
    })
  })
})
