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

  describe('generateLockAddress', () => {
    describe('_create2Address', () => {
      it('should compute the correct address', async () => {
        expect.assertions(1)
        const unlockAddress = '0xBe6ed9A686D288f23C721697e828480E13d138F2'
        const templateAddress = '0x842207a6a95A0455415db073352d18eB54C728a8'
        const account = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
        const lockSalt = '1d24dcf6d1c86a947c0e9563'
        expect(
          web3Service._create2Address(
            unlockAddress,
            templateAddress,
            account,
            lockSalt
          )
        ).toEqual('0x1c3c3E32878905490eDDFa7c98C47E6EBb003541')
      })
    })
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
