import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
// Note, we use name import to import the non connected version of the component for testing
import { CreatorAccount } from '../../../components/creator/CreatorAccount'
import createUnlockStore from '../../../createUnlockStore'

const account = {
  address: '0x3ca206264762caf81a8f0a843bbb850987b41e16',
  balance: '200000000000000000',
}
const network = {
  name: 4,
}
const currency = {
  USD: 195.99,
}
const store = createUnlockStore({ currency })

let wrapper

afterEach(rtl.cleanup)
describe('CreatorAccount', () => {
  beforeEach(() => {
    wrapper = rtl.render(
      <Provider store={store}>
        <CreatorAccount account={account} network={network} />
      </Provider>
    )
  })

  it('should show the right network name', () => {
    expect(wrapper.queryByText('Rinkeby')).not.toBeNull()
  })

  it('should show the balance of the creator account', () => {
    // eth value
    expect(wrapper.queryByText('0.2')).not.toBeNull()
    // usd value
    expect(wrapper.queryByText('39.20')).toBeNull()
  })
})
