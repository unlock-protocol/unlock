import React from 'react'
import * as rtl from 'react-testing-library'
// Note, we use name import to import the non connected version of the component for testing
import { BalanceProvider } from '../../../components/helpers/BalanceProvider'

describe('BalanceProvider Component', () => {
  function renderIt({
    amount,
    unit = 'szabo',
    conversion = { USD: 195.99 },
    render,
  }) {
    return rtl.render(
      <BalanceProvider
        amount={amount}
        unit={unit}
        conversion={conversion}
        render={render}
      />
    )
  }
  it('renders with - when amount is null (probably unset)', () => {
    renderIt({
      amount: null,
      unit: 'eth',
      conversion: {},
      render: (ethValue, fiatValue) => {
        expect(ethValue).toEqual(' - ')
        expect(fiatValue).toEqual(' - ')
      },
    })
  })

  it('renders with - when amount is undefined (probably loading)', () => {
    renderIt({
      amount: undefined,
      unit: 'eth',
      conversion: {},
      render: (ethValue, fiatValue) => {
        expect(ethValue).toEqual(' - ')
        expect(fiatValue).toEqual(' - ')
      },
    })
  })

  it('USD conversion data is not available', () => {
    renderIt({
      amount: '100',
      unit: 'eth',
      conversion: {},
      render: (ethValue, fiatValue) => {
        expect(ethValue).toEqual('100.00')
        expect(fiatValue).toEqual('---')
      },
    })
  })

  it('USD conversion data is available', () => {
    renderIt({
      amount: '100',
      unit: 'eth',
      render: (ethValue, fiatValue) => {
        expect(ethValue).toEqual('100.00')
        expect(fiatValue).toEqual('19,599')
      },
    })
  })

  describe('when the balance is 0 Eth', () => {
    it('should render 0 for both values', () => {
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
    const amount = '70'

    it('shows the default minimum value of 三 < 0.0001', () => {
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
    const amount = '75800'

    it('shows the balance in Eth to two decimal places', () => {
      renderIt({
        amount,
        render: (ethValue, fiatValue) => {
          expect(ethValue).toEqual('0.076')
          expect(fiatValue).toEqual('14.86')
        },
      })
    })
  })

  describe('when the balance is > 1 Eth ', () => {
    const amount = '2000000'

    it('shows the balance in Eth to two decimal places', () => {
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
    const amount = '1998887'

    it('shows the balance in Eth without rounding up', () => {
      renderIt({
        amount,
        render: ethValue => {
          expect(ethValue).toEqual('1.99')
        },
      })
    })
  })

  describe('when the balance converts to > $1000 ', () => {
    const amount = '20000000'

    it('shows the balance in dollars in locale format without decimal', () => {
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
    const amount = '2000000000'

    it('shows the balance in thousands of dollars postfixed with k', () => {
      renderIt({
        amount,
        render: (ethValue, fiatValue) => {
          expect(ethValue).toEqual('2000.00')
          expect(fiatValue).toEqual('392k')
        },
      })
    })
  })

  describe('when the balance converts to > $1m ', () => {
    const amount = '20000000000'

    it('shows the balance in millions of dollars postfixed with m', () => {
      renderIt({
        amount,
        render: (ethValue, fiatValue) => {
          expect(ethValue).toEqual('20000.00')
          expect(fiatValue).toEqual('3.9m')
        },
      })
    })
  })

  describe('when the balance converts to > $1b ', () => {
    const amount = '20000000000000'

    it('shows the balance in billions of dollars postfixed with b', () => {
      renderIt({
        amount,
        render: (ethValue, fiatValue) => {
          expect(ethValue).toEqual('20000000.00')
          expect(fiatValue).toEqual('3.9b')
        },
      })
    })
  })
})
