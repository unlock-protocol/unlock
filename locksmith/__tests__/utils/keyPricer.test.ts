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
  tokenAddress: '0x0000000000000000000000000000000000000000',
}

const zzzLock = {
  asOf: 227,
  balance: '0.01',
  expirationDuration: 2592000,
  keyPrice: '0.01',
  maxNumberOfKeys: 10,
  outstandingKeys: 1,
  erc20Symbol: 'ZZZ',
  owner: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
  tokenAddress: '0x0100000000000000000000000000000000000001',
}

const mockWeb3Service: { getLock: any } = {
  getLock: jest
    .fn()
    .mockResolvedValueOnce(standardLock)
    .mockResolvedValueOnce(zzzLock)
    .mockResolvedValue(standardLock),
}

function getMockWeb3Service() {
  return mockWeb3Service
}

jest.mock('@unlock-protocol/unlock-js', () => ({
  Web3Service: getMockWeb3Service,
}))

jest.mock('../../src/utils/ethPrice', () => ({
  getPrice: jest.fn(() => Promise.resolve(101.18)),
}))

const keyPricer = new KeyPricer()
const spy = jest.spyOn(PriceConversion.prototype, 'convertToUSD')

// jest.spyOn(ethers, 'getDefaultProvider').mockReturnValue(({
//   getGasPrice: jest.fn(() => Promise.resolve(new BigNumber(100)))
// }))

describe('KeyPricer', () => {
  describe('keyPriceUSD', () => {
    describe('when the lock currency has an exchange rate on coinbase', () => {
      it('returns the key price in USD', async () => {
        expect.assertions(1)
        await keyPricer.keyPriceUSD('an address', 1984)
        expect(spy).toBeCalledWith('ETH', '0.01')
      })
    })
    describe('when the lock currency does not have an exchange rate on coinbase', () => {
      it('throws an error', async () => {
        expect.assertions(1)
        try {
          await keyPricer.keyPriceUSD('zzz address', 1984)
        } catch {
          expect(spy).toBeCalledWith('ZZZ', '0.01')
        }
      })
    })
  })

  describe('gasFee', () => {
    it.skip('should return zero cents because gas is covered by the service fee', async () => {
      expect.assertions(1)
      const price = await keyPricer.gasFee()
      expect(price).toBe(1.09284518)
    })
  })

  describe('unlockServiceFee', () => {
    it('should return our vig', () => {
      expect.assertions(1)

      expect(keyPricer.unlockServiceFee()).toBe(50)
    })
  })

  describe('keyPrice', () => {
    it('should retrieve the price for a key on the lock', async () => {
      expect.assertions(1)

      // This lock address isn't important because we mock the return value
      const price = await keyPricer.keyPrice('an address', 1984)

      expect(price).toBe(1)
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
