import { vi, describe, beforeAll, expect, it } from 'vitest'
import { currencySymbol } from '../../utils/lock'

const defaultERC20 = {
  address: '0xerc20',
  name: 'TOKEN',
}

describe('currencySymbol', () => {
  it('should return the locks currencySymbol if it is set', async () => {
    expect.assertions(1)
    const lock = {
      currencySymbol: 'cDAI',
    }
    expect(currencySymbol(lock, defaultERC20)).toBe('cDAI')
  })

  it('should return the defaultERC20 symbol if the lock if for that currency', async () => {
    expect.assertions(1)
    const lock = {
      currencyContractAddress: defaultERC20.address,
    }
    expect(currencySymbol(lock, defaultERC20)).toBe('ERC20')
  })

  it('should return ERC20 if the lock is for another currency', () => {
    expect.assertions(1)
    const lock = {
      currencyContractAddress: '0x456',
    }
    expect(currencySymbol(lock, defaultERC20)).toBe('ERC20')
  })
})
