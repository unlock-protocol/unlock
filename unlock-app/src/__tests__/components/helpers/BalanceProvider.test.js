import React from 'react'
import * as rtl from 'react-testing-library'
// Note, we use name import to import the non connected version of the component for testing
import { BalanceProvider } from '../../../components/helpers/BalanceProvider'

describe('BalanceProvider Component', () => {
  function renderIt({ amount, conversion = { USD: 195.99 }, render }) {
    return rtl.render(
      <BalanceProvider
        amount={amount}
        conversion={conversion}
        render={render}
      />
    )
  }
  it('renders with - when amount is null (probably unset)', () => {
    expect.assertions(2)
    renderIt({
      amount: null,
      conversion: {},
      render: (ethValue, fiatValue) => {
        expect(ethValue).toEqual(' - ')
        expect(fiatValue).toEqual(' - ')
      },
    })
  })

  it('renders with - when amount is undefined (probably loading)', () => {
    expect.assertions(2)
    renderIt({
      amount: undefined,
      conversion: {},
      render: (ethValue, fiatValue) => {
        expect(ethValue).toEqual(' - ')
        expect(fiatValue).toEqual(' - ')
      },
    })
  })

  it('USD conversion data is not available', () => {
    expect.assertions(2)
    renderIt({
      amount: '100',
      conversion: {},
      render: (ethValue, fiatValue) => {
        expect(ethValue).toEqual('100.00')
        expect(fiatValue).toEqual('---')
      },
    })
  })

  it('USD conversion data is available', () => {
    expect.assertions(2)
    renderIt({
      amount: '100',
      render: (ethValue, fiatValue) => {
        expect(ethValue).toEqual('100.00')
        expect(fiatValue).toEqual('19,599')
      },
    })
  })

  describe('when the balance is 0 Eth', () => {
    it('should render 0 for both values', () => {
      expect.assertions(2)
      renderIt({
        amount: '0',
        render: (ethValue, fiatValue) => {
          expect(ethValue).toEqual('0')
          expect(fiatValue).toEqual('0')
        },
      })
    })
  })

  describe('when the balance is < 0.0001 Eth', () => {
    const amount = '0.000070'

    it('shows the default minimum value of 三 < 0.0001', () => {
      expect.assertions(2)
      renderIt({
        amount,
        render: (ethValue, fiatValue) => {
          expect(ethValue).toEqual('< 0.0001')
          expect(fiatValue).toEqual('0.014')
        },
      })
    })
  })

  describe('when the balance is > 0.0001 Eth and less than 1 Eth', () => {
    const amount = '0.0002'

    it('shows the balance in Eth to two decimal places', () => {
      expect.assertions(2)
      renderIt({
        amount,
        render: (ethValue, fiatValue) => {
          expect(ethValue).toEqual('0.0002')
          expect(fiatValue).toEqual('0.039')
        },
      })
    })
  })

  describe('when the balance is > 1 Eth ', () => {
    const amount = '2.0'

    it('shows the balance in Eth to two decimal places', () => {
      expect.assertions(2)
      renderIt({
        amount,
        render: (ethValue, fiatValue) => {
          expect(ethValue).toEqual('2.00')
          expect(fiatValue).toEqual('391.98')
        },
      })
    })
  })

  describe('when the balance would round up', () => {
    const amount = '1.9989816877'

    it('shows the balance in Eth with rounding up', () => {
      expect.assertions(1)
      renderIt({
        amount,
        render: ethValue => {
          expect(ethValue).toEqual('2.00')
        },
      })
    })
  })

  describe('when the balance converts to > $1000 ', () => {
    const amount = '20'

    it('shows the balance in dollars in locale format without decimal', () => {
      expect.assertions(2)
      renderIt({
        amount,
        render: (ethValue, fiatValue) => {
          expect(ethValue).toEqual('20.00')
          expect(fiatValue).toEqual('3,920')
        },
      })
    })
  })

  describe('when the balance converts to > $100k ', () => {
    const amount = '2000'

    it('shows the balance in thousands of dollars postfixed with k', () => {
      expect.assertions(2)
      renderIt({
        amount,
        render: (ethValue, fiatValue) => {
          expect(ethValue).toEqual('2,000')
          expect(fiatValue).toEqual('392k')
        },
      })
    })
  })

  describe('when the balance converts to > $1m ', () => {
    const amount = '20000'

    it('shows the balance in millions of dollars postfixed with m', () => {
      expect.assertions(2)
      renderIt({
        amount,
        render: (ethValue, fiatValue) => {
          expect(ethValue).toEqual('20,000')
          expect(fiatValue).toEqual('3.9m')
        },
      })
    })
  })

  describe('when the balance converts to > $1b ', () => {
    const amount = '20000000'

    it('shows the balance in billions of dollars postfixed with b', () => {
      expect.assertions(2)
      renderIt({
        amount,
        render: (ethValue, fiatValue) => {
          expect(ethValue).toEqual('20m')
          expect(fiatValue).toEqual('3.9b')
        },
      })
    })
  })
})
