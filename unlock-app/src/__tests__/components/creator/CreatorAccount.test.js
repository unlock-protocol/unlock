import React from 'react'
import { shallow } from 'enzyme'
// Note, we use name import to import the non connected version of the component for testing
import { CreatorAccount } from '../../../components/creator/CreatorAccount'

describe('CreatorAccount', () => {
  it('should show the balance of the creator account', () => {
    const account = {
      address: '0x3ca206264762caf81a8f0a843bbb850987b41e16',
      balance: '17.73',
    }
    const network = {
      name: 4,
    }
    const conversion = {
      USD: 195.99
    }

    const wrapper = shallow(<CreatorAccount account={account} network={network} conversion={conversion} />)
    expect(wrapper.find('Balance').first().props().amount).toEqual('17.73')
    expect(wrapper.find('Balance').first().props().conversion).toEqual({ USD: 195.99 })
  })
})
