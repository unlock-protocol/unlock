import { reducer } from '../../hooks/useCheckoutStore'
import {
  setConfig,
  setShowingLogin,
  setPurchasingLockAddress,
  setTransactionHash,
  setShowingMetadataForm,
  setDelayedPurchase,
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

const newDelayedPurchase = {
  lockAddress: '0xalock',
  purchaseKey: jest.fn(),
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

  it('returns the state updated with a new transaction hash on setTransactionHash', () => {
    expect.assertions(1)

    const transactionHash = '0xthehash'

    expect(reducer(undefined, setTransactionHash(transactionHash))).toEqual(
      expect.objectContaining({
        transactionHash,
      })
    )
  })

  it('returns the state updated with the new metadata form state on setShowingMetadataForm', () => {
    expect.assertions(1)

    expect(reducer(undefined, setShowingMetadataForm(true))).toEqual(
      expect.objectContaining({
        showingMetadataForm: true,
      })
    )
  })

  it('returns the state updated with a new delayed purchase on setDelayedPurchase', () => {
    expect.assertions(1)

    expect(reducer(undefined, setDelayedPurchase(newDelayedPurchase))).toEqual(
      expect.objectContaining({
        delayedPurchase: newDelayedPurchase,
      })
    )
  })
})
