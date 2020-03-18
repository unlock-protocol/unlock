import * as rtl from '@testing-library/react'
import { renderLock } from '../../../../components/interface/checkout/UserAccountLocks'

const lock = {
  name: 'a test lock',
  address: '0xlock',
  keyPrice: '0.01',
  expirationDuration: 555555555,
  currencyContractAddress: null,
}

const prices = {
  [lock.address]: {
    usd: '12.33',
  },
}

describe('UserAccountLocks', () => {
  describe('renderLock helper', () => {
    it('renders a disabled crypto lock for locks that do not have fiat prices', () => {
      expect.assertions(0)

      const { getByTestId, getByText } = rtl.render(renderLock(lock, {}))

      getByTestId('DisabledLock')
      getByText('0.01 ETH')
    })

    it('renders a disabled USD lock for locks that do have fiat prices', () => {
      expect.assertions(0)

      const { getByTestId, getByText } = rtl.render(renderLock(lock, prices))

      // After future work, this won't be a DisabledLock but a UserAccountLock
      getByTestId('DisabledLock')
      getByText('$12.33')
    })
  })
})
