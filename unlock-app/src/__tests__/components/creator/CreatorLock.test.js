import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
import EventEmitter from 'events'

import { CreatorLock } from '../../../components/creator/CreatorLock'
import configure from '../../../config'
import createUnlockStore from '../../../createUnlockStore'

jest.mock('next/link', () => {
  return ({ children }) => children
})

/**
 * Mocking web3Service
 * Default objects yielded by promises
 */
class MockWebService extends EventEmitter {
  constructor() {
    super()
    this.ready = true
  }
}

let mockWeb3Service = new MockWebService()

jest.mock('../../../services/web3Service', () => {
  return function() {
    return mockWeb3Service
  }
})

const lock = {
  id: 'lockid',
  address: '0x1234567890',
  transaction: 'transactionid',
  keyPrice: '1',
  balance: '1',
  expirationDuration: 100,
}
const keylock = {
  id: 'lockid',
  address: '0x1234567890',
  transaction: 'transactionid',
  keyPrice: '1',
  balance: '1',
  outstandingKeys: 1,
  maxNumberOfKeys: 10,
  expirationDuration: 100,
}
const transaction = {
  id: 'transactionid',
  address: '0x0987654321',
  confirmations: 12,
  status: 'mined',
  lock: 'lockid',
}

describe('CreatorLock', () => {
  it('should show embed code when the button is clicked', () => {
    const config = configure({
      requiredConfirmations: 6,
    })

    const store = createUnlockStore()

    let wrapper = rtl.render(
      <Provider store={store} config={config}>
        <CreatorLock lock={lock} transaction={transaction} />
      </Provider>
    )

    expect(
      wrapper.queryByText('This content is only visible', { exact: false })
    ).toBeNull()

    let codeButton = wrapper.getByTitle('Show embed code')
    rtl.fireEvent.click(codeButton)

    expect(
      wrapper.queryByText('This content is only visible', { exact: false })
    ).not.toBeNull()
  })
  it('should display the correct number of keys', () => {
    const config = configure({
      requiredConfirmations: 6,
    })

    const store = createUnlockStore({
      transactions: {
        transactionid: transaction,
      },
      locks: {
        lockid: keylock,
      },
    })

    let wrapper = rtl.render(
      <Provider store={store} config={config}>
        <CreatorLock lock={keylock} transaction={transaction} />
      </Provider>
    )

    expect(wrapper.queryByText('1/10')).not.toBeNull()
  })
  it('should initiate balance withdrawal when withdraw button is clicked', () => {
    const config = configure({
      requiredConfirmations: 6,
    })

    const account = {
      address: '0x12345',
    }

    const store = createUnlockStore({
      transactions: {
        transactionid: transaction,
      },
      locks: {
        lockid: keylock,
      },
      account: account,
    })

    mockWeb3Service.withdrawFromLock = jest.fn()

    let wrapper = rtl.render(
      <Provider store={store} config={config}>
        <CreatorLock lock={keylock} transaction={transaction} />
      </Provider>
    )

    let withdrawButton = wrapper.getByTitle('Withdraw balance')
    rtl.fireEvent.click(withdrawButton)

    expect(mockWeb3Service.withdrawFromLock).toHaveBeenCalledWith(
      keylock,
      account
    )
  })
})
