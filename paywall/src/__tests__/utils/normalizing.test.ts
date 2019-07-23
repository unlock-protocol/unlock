import {
  normalizeLockAddress,
  normalizeAddressKeys,
} from '../../utils/normalizeAddresses'

describe('BlockchainHandler - normalizing functionality', () => {
  describe('normalizeLockAddress', () => {
    it('should normalize a lock address to all lower case', () => {
      expect.assertions(2)

      const upperAddress = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
      const lowerAddress = upperAddress.toLowerCase()

      expect(normalizeLockAddress(upperAddress)).toBe(lowerAddress)
      expect(normalizeLockAddress(lowerAddress)).toBe(lowerAddress)
    })
  })

  describe('normalizeAddressKeys', () => {
    it('should normalize all keys of an object to lower case', () => {
      expect.assertions(1)

      const addresses = [
        '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
        '0x15B87bdC4B3ecb783F56f735653332EAD3BCa5F8',
        '0xBF7F1bdB3a2D6c318603FFc8f39974e597b6af5e',
      ]
      const lowerAddresses = addresses.map(address => address.toLowerCase())
      const obj = {
        [addresses[0]]: 0,
        [addresses[1]]: 1,
        [addresses[2]]: 2,
      }
      const expectedObj = {
        [lowerAddresses[0]]: 0,
        [lowerAddresses[1]]: 1,
        [lowerAddresses[2]]: 2,
      }

      expect(normalizeAddressKeys(obj)).toEqual(expectedObj)
    })
  })
})
