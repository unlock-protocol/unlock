import { reducer } from '../../hooks/useCheckoutStore'
import {
  setConfig,
  setShowingLogin,
  setPurchasingLockAddress,
} from '../../utils/checkoutActions'

const newConfig = {
  locks: {
    '0xlockaddress': {
      name: 'a lock',
    },
  },
  callToAction: {
    default: '',
    expired: '',
    pending: '',
    confirmed: '',
    noWallet: '',
  },
}

describe('useCheckoutStore -- reducer', () => {
  it('returns the state updated with a new config on setConfig', () => {
    expect.assertions(1)

    expect(reducer(undefined, setConfig(newConfig))).toEqual(
      expect.objectContaining({
        config: newConfig,
      })
    )
  })

  it('returns the state updated with the new login state on setShowingLogin', () => {
    expect.assertions(1)

    expect(reducer(undefined, setShowingLogin(true))).toEqual(
      expect.objectContaining({
        showingLogin: true,
      })
    )
  })

  it('returns the state updated with a new purchasing address on setPurchasingLockAddress', () => {
    expect.assertions(1)

    const newAddress = '0xthenewaddress'

    expect(reducer(undefined, setPurchasingLockAddress(newAddress))).toEqual(
      expect.objectContaining({
        purchasingLockAddress: newAddress,
      })
    )
  })
})
