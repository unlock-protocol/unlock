import React from 'react'
import { Provider } from 'react-redux'
import * as rtl from '@testing-library/react'
// Note, we use name import to import the non connected version of the component for testing
import { Balance } from '../../../components/helpers/Balance'
import createUnlockStore from '../../../createUnlockStore'

describe('Balance Component', () => {
  const store = createUnlockStore()

  function renderIt(amount) {
    return rtl.render(
      <Provider store={store}>
        <Balance amount={amount} />
      </Provider>
    )
  }

  describe('when the balance is < 0.0001 Eth', () => {
    const amount = '0.000070'

    it('shows the default minimum value of 三 < 0.0001', () => {
      expect.assertions(0)
      const wrapper = renderIt(amount)
      wrapper.getByText('< 0.0001')
    })
  })

  describe('when the balance is > 0.0001 Eth and less than 1 Eth', () => {
    const amount = '0.075800'

    it('shows the balance in Eth to two decimal places', () => {
      expect.assertions(0)
      const wrapper = renderIt(amount)
      wrapper.getByText('0.076')
    })
  })

  describe('when the balance is > 1 Eth ', () => {
    const amount = '2'

    it('shows the balance in Eth to two decimal places', () => {
      expect.assertions(0)
      const wrapper = renderIt(amount)
      wrapper.getByText('2.00')
    })
  })
})
