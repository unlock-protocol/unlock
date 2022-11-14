import Web3Service from '../web3Service'
import PublicLockVersions from '../PublicLock'
import networks from '@unlock-protocol/networks'
import { getCoinbasePricing } from './helpers/coinbase'

var web3Service = new Web3Service(networks)

jest.setTimeout(100000)

describe('Web3Service', () => {
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

    it.each(Object.keys(PublicLockVersions))('Get lock function', async () => {
      expect.assertions(2)
      const lockAddress = '0xe6a85e67905d41a479a32ff59892861351c825e8'
      const response = await web3Service.getLock(lockAddress, 5)

      expect(response.address).toBe(lockAddress)

      const notFromUnlockFactoryContract = async () => {
        // Fake generated address
        const response = await web3Service.getLock(
          '0xAfC5356c67853fC8045586722fE6a253023039eB',
          5
        )
        return response
      }

      await expect(notFromUnlockFactoryContract).rejects.toThrow()
    })
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

  describe('Uniswap pricing', () => {
    it('Return WETH price to USDC', async () => {
      expect.assertions(1)
      const uniswap = await web3Service.consultUniswap({
        // WETH
        tokenInAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        amount: '1',
      })

      const coinbase = await getCoinbasePricing('ETH', 1)
      const diff = Math.ceil((uniswap / coinbase) * 100)
      expect(diff).toBeGreaterThan(95)
    })
    it('Return MATIC price to USDC', async () => {
      expect.assertions(1)
      const uniswap = await web3Service.consultUniswap({
        // MATIC
        tokenInAddress: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
        amount: '1',
      })

      const coinbase = await getCoinbasePricing('MATIC', 1)
      const diff = Math.ceil((uniswap / coinbase) * 100)
      expect(diff).toBeGreaterThan(95)
    })
    it('Return WBTC price to USDC', async () => {
      expect.assertions(1)
      const uniswap = await web3Service.consultUniswap({
        // WBTC
        tokenInAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        amount: '1',
      })

      const coinbase = await getCoinbasePricing('BTC', 1)
      const diff = Math.ceil((uniswap / coinbase) * 100)
      expect(diff).toBeGreaterThan(95)
    })
    it('Return LINK price to USDC', async () => {
      expect.assertions(1)
      const uniswap = await web3Service.consultUniswap({
        // LINK
        tokenInAddress: '0x514910771af9ca656af840dff83e8264ecf986ca',
        amount: '1',
      })

      const coinbase = await getCoinbasePricing('LINK', 1)
      const diff = Math.ceil((uniswap / coinbase) * 100)
      expect(diff).toBeGreaterThan(95)
    })
    it('Return USDT price to USDC', async () => {
      expect.assertions(1)
      const uniswap = await web3Service.consultUniswap({
        // USDT
        tokenInAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        amount: '1',
      })

      const coinbase = await getCoinbasePricing('USDT', 1)
      const diff = Math.ceil((uniswap / coinbase) * 100)
      expect(diff).toBeGreaterThan(95)
    })
  })
})
