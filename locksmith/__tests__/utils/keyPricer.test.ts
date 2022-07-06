// import { ethers } from 'ethers'
// import { BigNumber } from 'ethers/utils'
import KeyPricer from '../../src/utils/keyPricer'
import PriceConversion from '../../src/utils/priceConversion'

const standardLock = {
  asOf: 227,
  balance: '0.01',
  expirationDuration: 2592000,
  keyPrice: '0.01',
  maxNumberOfKeys: 10,
  outstandingKeys: 1,
  owner: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
  currencyContractAddress: '0x0000000000000000000000000000000000000000',
  currencySymbol: null,
}

const mockWeb3Service: { getLock: any } = {
  getLock: jest.fn(),
}

function getMockWeb3Service() {
  return mockWeb3Service
}

jest.mock('@unlock-protocol/unlock-js', () => ({
  Web3Service: getMockWeb3Service,
}))

jest.mock('../../src/utils/ethPrice', () => async () => ({
  getPrice: jest.fn(() => Promise.resolve(101.18)),
}))

jest.mock('../../src/utils/gasPrice', () => {
  return jest.fn(() => {
    return {
      gasPriceUSD: () => 0.01,
    }
  })
})

const keyPricer = new KeyPricer()
const spy = jest.spyOn(PriceConversion.prototype, 'convertToUSD')
describe('KeyPricer', () => {
  describe('keyPriceUSD', () => {
    describe('when the lock currency has an exchange rate on coinbase', () => {
      it('returns the key price in USD', async () => {
        expect.assertions(1)
        mockWeb3Service.getLock.mockResolvedValueOnce(standardLock)
        await keyPricer.keyPriceUSD(
          '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          1
        ) // default to Eth
        expect(spy).toBeCalledWith('ETH', '0.01')
      })
    })
  })

  describe('Generate price', () => {
    it('Generate price for a single quantity key', async () => {
      expect.assertions(3)
      mockWeb3Service.getLock.mockResolvedValueOnce(standardLock)
      const pricing = await keyPricer.generate(
        '0x77Cc4f1FE4555F9B9E0d1E918caC211915B079e5',
        100
      )

      expect(pricing.keyPrice).toBe(1)
      expect(pricing.creditCardProcessing).toBe(31)
      expect(pricing.unlockServiceFee).toBe(1.01)
    })

    it('Generate price for multiple quantity keys', async () => {
      expect.assertions(3)
      mockWeb3Service.getLock.mockResolvedValueOnce(standardLock)
      const pricing = await keyPricer.generate(
        '0x77Cc4f1FE4555F9B9E0d1E918caC211915B079e5',
        100,
        100
      )

      expect(pricing.keyPrice).toBe(100)
      expect(pricing.unlockServiceFee).toBe(10.01)
      expect(pricing.creditCardProcessing).toBe(34)
    })
  })

  describe('unlockServiceFee', () => {
    it('should return our vig', () => {
      expect.assertions(1)

      expect(keyPricer.unlockServiceFee(1000)).toBe(100)
    })
  })

  describe('creditCardProcessingFee', () => {
    it('should return $0.35 on a 1DAI lock', () => {
      expect.assertions(1)

      /**
       * key price:          100
       * gas fee:              0
       * unlockServiceFee:    50
       * stripe percentage:    5 (150 * 0.029, rounded up)
       * stripe flat fee:      30
       *                   -----
       * total:              185
       */

      expect(keyPricer.creditCardProcessingFee(100)).toBe(33)
    })

    it('should return $0.61 on a 10DAI lock', () => {
      expect.assertions(1)

      /**
       * key price:          1000
       * gas fee:               0
       * unlockServiceFee:    100
       * stripe percentage:    32 (1100 * 0.029, rounded up)
       * stripe flat fee:       30
       *                   ------
       * total:              1112
       */

      expect(keyPricer.creditCardProcessingFee(1000)).toBe(59)
    })
  })
})
