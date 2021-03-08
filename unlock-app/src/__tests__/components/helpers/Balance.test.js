import React from 'react'
import * as rtl from '@testing-library/react'
import { Balance } from '../../../components/helpers/Balance'

describe('Balance Component', () => {
  function renderIt(amount) {
    return rtl.render(<Balance amount={amount} />)
  }

  describe('when the balance is < 0.0001 Eth', () => {
    const amount = '0.000070'

    it.skip('shows the default minimum value of 三 < 0.0001', () => {
      expect.assertions(0)
      const wrapper = renderIt(amount)
      wrapper.getByText('< 0.0001')
    })
  })

  describe('when the balance is > 0.0001 Eth and less than 1 Eth', () => {
    const amount = '0.075800'

    it.skip('shows the balance in Eth to two decimal places', () => {
      expect.assertions(0)
      const wrapper = renderIt(amount)
      wrapper.getByText('0.076')
    })
  })

  describe('when the balance is > 1 Eth ', () => {
    const amount = '2'

    it.skip('shows the balance in Eth to two decimal places', () => {
      expect.assertions(0)
      const wrapper = renderIt(amount)
      wrapper.getByText('2.00')
    })
  })
})
