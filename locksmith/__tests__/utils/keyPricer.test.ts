import KeyPricer from '../../src/utils/keyPricer'

let mockWeb3Service: { getLock: any }

let standardLock = {
  asOf: 227,
  balance: '0.01',
  expirationDuration: 2592000,
  keyPrice: '0.01',
  maxNumberOfKeys: 10,
  outstandingKeys: 1,
  owner: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
}

mockWeb3Service = {
  getLock: jest
    .fn()
    .mockResolvedValue(standardLock)
    .mockResolvedValueOnce(standardLock),
}

jest.mock('@unlock-protocol/unlock-js', () => ({
  Web3Service: function() {
    return mockWeb3Service
  },
}))

const keyPricer = new KeyPricer('provider url', 'unlock contract address')

describe('KeyPricer', () => {
  describe('gasFee', () => {
    it('should return zero cents because gas is covered by the service fee', () => {
      expect.assertions(1)

      expect(keyPricer.gasFee()).toBe(0)
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
      const price = await keyPricer.keyPrice('an address')

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
       * stripe flat fee:     30
       *                   -----
       * total:              185
       */

      expect(keyPricer.creditCardProcessingFee(100)).toBe(35)
    })

    it('should return $0.61 on a 10DAI lock', () => {
      expect.assertions(1)

      /**
       * key price:          1000
       * gas fee:               0
       * unlockServiceFee:     50
       * stripe percentage:    31 (1050 * 0.029, rounded up)
       * stripe flat fee:      30
       *                   ------
       * total:              1111
       */

      expect(keyPricer.creditCardProcessingFee(1000)).toBe(61)
    })
  })
})
