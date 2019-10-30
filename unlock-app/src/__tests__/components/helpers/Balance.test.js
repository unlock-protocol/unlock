import React from 'react'
import { Provider } from 'react-redux'
import * as rtl from '@testing-library/react'
// Note, we use name import to import the non connected version of the component for testing
import { Balance } from '../../../components/helpers/Balance'
import createUnlockStore from '../../../createUnlockStore'

describe('Balance Component', () => {
  const store = createUnlockStore({
    currency: { USD: 195.99 },
  })

  function renderIt(amount, convertCurrency = true) {
    return rtl.render(
      <Provider store={store}>
        <Balance amount={amount} convertCurrency={convertCurrency} />
      </Provider>
    )
  }

  describe('when the balance is 0 Eth', () => {
    const amount = '0'

    it('USD conversion data available', () => {
      expect.assertions(1)
      const wrapper = renderIt(amount)
      expect(wrapper.getAllByText('0')).toHaveLength(2)
    })
  })

  describe('when the balance is < 0.0001 Eth', () => {
    const amount = '0.000070'

    it('shows the default minimum value of 三 < 0.0001', () => {
      expect.assertions(0)
      const wrapper = renderIt(amount)
      wrapper.getByText('< 0.0001')
      wrapper.getByText('0.014')
    })
  })

  describe('when the balance is > 0.0001 Eth and less than 1 Eth', () => {
    const amount = '0.075800'

    it('shows the balance in Eth to two decimal places', () => {
      expect.assertions(0)
      const wrapper = renderIt(amount)
      wrapper.getByText('0.076')
      wrapper.getByText('14.86')
    })
  })

  describe('when the balance is > 1 Eth ', () => {
    const amount = '2'

    it('shows the balance in Eth to two decimal places', () => {
      expect.assertions(0)
      const wrapper = renderIt(amount)
      wrapper.getByText('2.00')
      wrapper.getByText('391.98')
    })
  })

  describe('when the balance converts to > $1000 ', () => {
    const amount = '20'

    it('shows the balance in dollars in locale format without decimal', () => {
      expect.assertions(0)
      const wrapper = renderIt(amount)
      wrapper.getByText('20.00')
      wrapper.getByText('3,920')
    })
  })

  describe('when the balance converts to > $100k ', () => {
    const amount = '2000'

    it('shows the balance in thousands of dollars postfixed with k', () => {
      expect.assertions(0)
      const wrapper = renderIt(amount)
      wrapper.getByText('2,000')
      wrapper.getByText('392k')
    })
  })

  describe('when the balance converts to > $1m ', () => {
    const amount = '20000'

    it('shows the balance in millions of dollars postfixed with m', () => {
      expect.assertions(0)
      const wrapper = renderIt(amount)
      wrapper.getByText('20,000')
      wrapper.getByText('3.9m')
    })
  })

  describe('when the balance converts to > $1b ', () => {
    const amount = '20000000'

    it('shows the balance in billions of dollars postfixed with b', () => {
      expect.assertions(0)
      const wrapper = renderIt(amount)
      wrapper.getByText('20m')
      wrapper.getByText('3.9b')
    })
  })
})
