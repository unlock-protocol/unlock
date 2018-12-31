import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'

import { LockIconBar } from '../../../../components/creator/lock/LockIconBar'
import configure from '../../../../config'
import createUnlockStore from '../../../../createUnlockStore'

const toggleCode = jest.fn()

describe('LockIconBar', () => {
  it('should display a submitted label when withdrawal has been submitted', () => {
    const config = configure()

    const lock = {
      id: 'lockwithdrawalsubmittedid',
      keyPrice: '10000000000000000000',
      expirationDuration: '172800',
      maxNumberOfKeys: 240,
      outstandingKeys: 3,
      address: '0xbc7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      transaction: 'deployedid',
    }
    const transaction = {
      status: 'mined',
      confirmations: 24,
    }
    const withdrawalTransaction = {
      status: 'submitted',
      confirmations: 0,
      withdrawal: '0xbc7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
    }

    const store = createUnlockStore({})

    let wrapper = rtl.render(
      <Provider store={store}>
        <LockIconBar
          lock={lock}
          transaction={transaction}
          withdrawalTransaction={withdrawalTransaction}
          toggleCode={toggleCode}
          config={config}
        />
      </Provider>
    )

    expect(
      wrapper.queryByText('Submitted to Network', { exact: false })
    ).not.toBeNull()
  })
  it('should display a confirming label when withdrawal is confirming', () => {
    const config = configure()

    const lock = {
      id: 'lockwithdrawalconfirmingid',
      keyPrice: '10000000000000000000',
      expirationDuration: '172800',
      maxNumberOfKeys: 240,
      outstandingKeys: 3,
      address: '0xba7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      transaction: 'deployedid',
    }
    const transaction = {
      status: 'mined',
      confirmations: 24,
    }
    const withdrawalTransaction = {
      status: 'mined',
      confirmations: 2,
      withdrawal: 'lockwithdrawalconfirmingid',
    }

    const store = createUnlockStore({})

    let wrapper = rtl.render(
      <Provider store={store}>
        <LockIconBar
          lock={lock}
          transaction={transaction}
          withdrawalTransaction={withdrawalTransaction}
          toggleCode={toggleCode}
          config={config}
        />
      </Provider>
    )

    expect(
      wrapper.queryByText('Confirming Withdrawal', { exact: false })
    ).not.toBeNull()
    expect(wrapper.queryByText('2/12', { exact: false })).not.toBeNull()
  })
})
