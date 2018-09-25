import React from 'react'
import { render } from 'enzyme'
// Note, we use name import to import the non connected version of the component for testing
import { Balance } from '../../../components/helpers/Balance'

describe('Balance Component', () => {

  const amount = '100000000'
  const unit = 'szabo'

  const wrapper = render(<Balance
    amount={amount}
    unit={unit} />)

  it('shows the balance in Eth', () => {
    expect(wrapper.text()).toEqual('100')
  })

  /**
   * Probably a bit brittle...
   */
  it('shows the Eth icon', () => {
    expect(wrapper.find('svg').toString()).toEqual('<svg width="1em" height="1em"><path d="M1 6V5h5v1H1zm-1 5v-1h7v1H0zM0 1V0h7v1H0z" fill="#333" fill-rule="evenodd"/></svg>')
  })

})
