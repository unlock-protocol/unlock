import React from 'react'
import * as rtl from 'react-testing-library'
import 'jest-dom/extend-expect'
import { Provider } from 'react-redux'

import { CreatorLock } from '../../../components/creator/CreatorLock'
import configure from '../../../config'
import createUnlockStore from '../../../createUnlockStore'

jest.mock('next/link', () => {
  return ({children}) => children
})

afterEach(rtl.cleanup)
describe('CreatorLock', () => {
  it ('should show embed code when the button is clicked', () => {

    const lock = {
      id: '0x123',
      address: '0x1234567890',
      transaction: '0x0987654321',
      keyPrice: '1',
      keyBalance: '1',

    }
    const transaction = {
      id: '0x098',
      address: '0x0987654321',
      confirmations: 12,
      status: 'mined',

    }
    const config = configure({
      requiredConfirmations: 6,
    })

    const store = createUnlockStore()

    let wrapper = rtl.render(
      <Provider store={store}>
        <CreatorLock lock={lock} transaction={transaction} config={config} />
      </Provider>)

    expect(wrapper.queryByText('This content is only visible', {exact: false})).toBeNull()

    let codeButton = wrapper.getByTitle('Show embed code')
    rtl.fireEvent.click(codeButton)

    expect(wrapper.queryByText('This content is only visible', {exact: false})).not.toBeNull()

  })
  it ('should display the correct number of keys', () => {

    const lock = {
      id: '0x123',
      address: '0x1234567890',
      transaction: '0x0987654321',
      keyPrice: '1',
      keyBalance: '1',
      outstandingKeys: 1,
      maxNumberOfKeys: 10,
    }
    const transaction = {
      id: '0x098',
      address: '0x0987654321',
      confirmations: 12,
      status: 'mined',

    }
    const config = configure({
      requiredConfirmations: 6,
    })

    const store = createUnlockStore()

    let wrapper = rtl.render(
    <Provider store={store}>
      <CreatorLock lock={lock} transaction={transaction} config={config} />
    </Provider>)

    expect(wrapper.queryByText('1/10')).not.toBeNull()
  })
})
