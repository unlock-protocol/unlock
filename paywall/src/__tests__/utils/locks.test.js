import { currencySymbolForLock } from '../../utils/locks'

import configure from '../../config'

const config = configure()

describe('locks utilities', () => {
  describe('currencySymbolForLock', () => {
    it('should return Eth by default', () => {
      expect.assertions(1)
      const lock = {}
      expect(currencySymbolForLock(lock, config)).toBe('Eth')
    })

    it('should return the configs symbold if this is an ERC20 matching the config', () => {
      expect.assertions(1)
      const lock = {
        currencyContractAddress: config.erc20Contract.address,
      }
      expect(currencySymbolForLock(lock, config)).toBe(
        config.erc20Contract.name
      )
    })

    it('should return ERC20 for all other ERC20', () => {
      expect.assertions(1)
      const lock = {
        currencyContractAddress: '0xMyERC20',
      }
      expect(currencySymbolForLock(lock, config)).toBe('ERC20')
    })
  })
})
