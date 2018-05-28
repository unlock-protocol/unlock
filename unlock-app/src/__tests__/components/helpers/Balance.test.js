import React from 'react'
import { shallow } from 'enzyme'
// Note, we use name import to import the non connected version of the component for testing
import { Balance } from '../../../components/helpers/Balance'

describe('Balance Component', () => {

  const amount = '100000000'
  const unit = 'szabo'

  const wrapper = shallow(<Balance
    amount={amount}
    unit={unit} />)

  it('shows the balance in Eth', () => {
    expect(wrapper.text()).toEqual('Ξ 100')
  })

})