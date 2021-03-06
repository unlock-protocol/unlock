import React from 'react'
import * as rtl from '@testing-library/react'
// Note, we use name import to import the non connected version of the component for testing
import { BalanceProvider } from '../../../components/helpers/BalanceProvider'

describe('BalanceProvider Component', () => {
  function renderIt({ amount, render }) {
    return rtl.render(<BalanceProvider amount={amount} render={render} />)
  }
  it('renders with - when amount is null (probably unset)', () => {
    expect.assertions(1)
    renderIt({
      amount: null,
      conversion: {},
      render: (ethValue) => {
        expect(ethValue).toEqual(' - ')
      },
    })
  })

  it('renders with - when amount is undefined (probably loading)', () => {
    expect.assertions(1)
    renderIt({
      amount: undefined,
      conversion: {},
      render: (ethValue) => {
        expect(ethValue).toEqual(' - ')
      },
    })
  })

  describe('when the balance is 0 Eth', () => {
    it.skip('should render 0 for both values', () => {
      expect.assertions(1)
      renderIt({
        amount: '0',
        render: (ethValue) => {
          expect(ethValue).toEqual('0')
        },
      })
    })
  })

  describe('when the balance is < 0.0001 Eth', () => {
    const amount = '0.000070'

    it.skip('shows the default minimum value of 三 < 0.0001', () => {
      expect.assertions(1)
      renderIt({
        amount,
        render: (ethValue) => {
          expect(ethValue).toEqual('< 0.0001')
        },
      })
    })
  })

  describe('when the balance is > 0.0001 Eth and less than 1 Eth', () => {
    const amount = '0.0002'

    it.skip('shows the balance in Eth to two decimal places', () => {
      expect.assertions(1)
      renderIt({
        amount,
        render: (ethValue) => {
          expect(ethValue).toEqual('0.0002')
        },
      })
    })
  })

  describe('when the balance is > 1 Eth ', () => {
    const amount = '2.0'

    it.skip('shows the balance in Eth to two decimal places', () => {
      expect.assertions(1)
      renderIt({
        amount,
        render: (ethValue) => {
          expect(ethValue).toEqual('2.00')
        },
      })
    })
  })

  describe('when the balance would round up', () => {
    const amount = '1.9989816877'

    it.skip('shows the balance in Eth with rounding up', () => {
      expect.assertions(1)
      renderIt({
        amount,
        render: (ethValue) => {
          expect(ethValue).toEqual('2.00')
        },
      })
    })
  })
})
