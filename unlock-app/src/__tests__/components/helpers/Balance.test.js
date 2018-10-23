import React from 'react'
import { render } from 'enzyme'
// Note, we use name import to import the non connected version of the component for testing
import { Balance } from '../../../components/helpers/Balance'

describe('Balance Component', () => {
  const unit = 'szabo'

  describe('when the balance is 0 Eth', () => {
    const amount = '0'

    const wrapper = render(<Balance
      amount={amount}
      unit={unit} />)

    it('shows the value of 三 0', () => {
      expect(wrapper.text()).toEqual('三 0')
    })
  })

  describe('when the balance is < 0.0001 Eth', () => {
    const amount = '70'

    const wrapper = render(<Balance
      amount={amount}
      unit={unit} />)

    it('shows the default minimum value of 三 < 0.0001', () => {
      expect(wrapper.text()).toEqual('三 < 0.0001')
    })
  })

  describe('when the balance is > 0.0001 Eth and less than 1 Eth', () => {
    const amount = '75800'

    const wrapper = render(<Balance
      amount={amount}
      unit={unit} />)

    it('shows the balance in Eth to two decimal places', () => {
      expect(wrapper.text()).toEqual('三 0.076')
    })
  })

  describe('when the balance is > 1 Eth ', () => {
    const amount = '2000000'

    const wrapper = render(<Balance
      amount={amount}
      unit={unit} />)

    it('shows the balance in Eth to two decimal places', () => {
      expect(wrapper.text()).toEqual('三 2.00')
    })
  })
})
