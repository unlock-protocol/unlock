import { describe, expect, it } from 'vitest'
import {
  getCreateLockFaucetPrompt,
  shouldShowCreateLockNetworkWarning,
} from '../../utils/createLockFormNotices'

describe('createLockFormNotices', () => {
  it('only shows the create lock network warning for Ethereum mainnet', () => {
    expect(shouldShowCreateLockNetworkWarning(1)).toBe(true)
    expect(shouldShowCreateLockNetworkWarning(10)).toBe(false)
  })

  it('uses singular faucet copy for one faucet', () => {
    expect(
      getCreateLockFaucetPrompt({
        faucetCount: 1,
        nativeCurrencyName: 'ETH',
      })
    ).toBe('Need some ETH to pay for gas? Try this faucet: ')
  })

  it('uses plural faucet copy for multiple faucets', () => {
    expect(
      getCreateLockFaucetPrompt({
        faucetCount: 2,
        nativeCurrencyName: 'MATIC',
      })
    ).toBe('Need some MATIC to pay for gas? Try one of these faucets: ')
  })
})
