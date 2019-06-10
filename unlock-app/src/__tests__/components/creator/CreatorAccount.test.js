import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
// Note, we use name import to import the non connected version of the component for testing
import { Account } from '../../../components/interface/Account'
import createUnlockStore from '../../../createUnlockStore'

const account = {
  address: '0x3ca206264762caf81a8f0a843bbb850987b41e16',
  balance: '0.2',
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
describe('Account', () => {
  beforeEach(() => {
    wrapper = rtl.render(
      <Provider store={store}>
        <Account account={account} network={network} />
      </Provider>
    )
  })

  it('should show the right network name', () => {
    expect.assertions(1)
    expect(wrapper.queryByText('Rinkeby')).not.toBeNull()
  })
})
