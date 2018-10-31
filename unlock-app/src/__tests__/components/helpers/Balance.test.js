import React from 'react'
import { render } from 'enzyme'
// Note, we use name import to import the non connected version of the component for testing
import { Balance } from '../../../components/helpers/Balance'

describe('Balance Component', () => {
  const unit = 'szabo'
  const conversion = { USD: 195.99 }

  describe('when the balance is 0 Eth', () => {
    const amount = '0'

    it('no conversion data available', () => {
      const wrapper = render(<Balance
        amount={amount}
        unit={unit}
        conversion={{ USD: undefined }}
      />)

      expect(wrapper.text()).toEqual('0---')
    })
    it('USD conversion data available', () => {
      const wrapper = render(<Balance
        amount={amount}
        unit={unit}
        conversion={conversion}
      />)
      expect(wrapper.text()).toEqual('00')
    })
  })

  describe('when the balance is < 0.0001 Eth', () => {
    const amount = '70'

    const wrapper = render(<Balance
      amount={amount}
      unit={unit}
      conversion={conversion}
    />)

    it('shows the default minimum value of 三 < 0.0001', () => {
      expect(wrapper.text()).toEqual('< 0.00010.014')
    })
  })

  describe('when the balance is > 0.0001 Eth and less than 1 Eth', () => {
    const amount = '75800'

    const wrapper = render(<Balance
      amount={amount}
      unit={unit}
      conversion={conversion}
    />)

    it('shows the balance in Eth to two decimal places', () => {
      expect(wrapper.text()).toEqual('0.07614.86')
    })
  })

  describe('when the balance is > 1 Eth ', () => {
    const amount = '2000000'

    const wrapper = render(<Balance
      amount={amount}
      unit={unit}
      conversion={conversion}
    />)

    it('shows the balance in Eth to two decimal places', () => {
      expect(wrapper.text()).toEqual('2.00391.98')
    })
  })

  describe('when the balance converts to > $1000 ', () => {
    const amount = '20000000'

    const wrapper = render(<Balance
      amount={amount}
      unit={unit}
      conversion={conversion}
    />)

    it('shows the balance in dollars in locale format without decimal', () => {
      expect(wrapper.text()).toEqual('20.003,920')
    })
  })

  describe('when the balance converts to > $100k ', () => {
    const amount = '2000000000'

    const wrapper = render(<Balance
      amount={amount}
      unit={unit}
      conversion={conversion}
    />)

    it('shows the balance in thousands of dollars postfixed with k', () => {
      expect(wrapper.text()).toEqual('2000.00392k')
    })
  })

  describe('when the balance converts to > $1m ', () => {
    const amount = '20000000000'

    const wrapper = render(<Balance
      amount={amount}
      unit={unit}
      conversion={conversion}
    />)

    it('shows the balance in millions of dollars postfixed with m', () => {
      expect(wrapper.text()).toEqual('20000.003.9m')
    })
  })

  describe('when the balance converts to > $1b ', () => {
    const amount = '20000000000000'

    const wrapper = render(<Balance
      amount={amount}
      unit={unit}
      conversion={conversion}
    />)

    it('shows the balance in billions of dollars postfixed with b', () => {
      expect(wrapper.text()).toEqual('20000000.003.9b')
    })
  })

  describe('when the balance converts to > $1b, unit is eth (used in lock form)', () => {
    const amount = '9999999'

    const wrapper = render(<Balance
      amount={amount}
      unit='eth'
      conversion={conversion}
    />)

    it('shows the balance in billions of dollars postfixed with b', () => {
      expect(wrapper.text()).toEqual('9999999.002b')
    })
  })
})
