import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'

import { LockIconBar } from '../../../../components/creator/lock/LockIconBar'
import configure from '../../../../config'
import createUnlockStore from '../../../../createUnlockStore'

describe('LockIconBar', () => {
  let config
  let lock
  let transaction
  let withdrawalTransaction
  let store
  let toggleCode
  beforeEach(() => {
    config = configure()

    lock = {
      id: 'lockwithdrawalsubmittedid',
      keyPrice: '10000000000000000000',
      expirationDuration: 172800,
      maxNumberOfKeys: 240,
      outstandingKeys: 3,
      address: '0xbc7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      transaction: 'deployedid',
    }
    transaction = {
      status: 'mined',
      confirmations: 24,
    }
    withdrawalTransaction = {
      status: 'submitted',
      confirmations: 0,
      withdrawal: '0xbc7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
    }

    store = createUnlockStore({})
    toggleCode = jest.fn()
  })

  it('should display a submitted label when withdrawal has been submitted', () => {
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

  it('should trigger edit when clicked', () => {
    const edit = jest.fn()

    let wrapper = rtl.render(
      <Provider store={store}>
        <LockIconBar
          lock={lock}
          transaction={transaction}
          withdrawalTransaction={withdrawalTransaction}
          toggleCode={toggleCode}
          config={config}
          edit={edit}
        />
      </Provider>
    )

    rtl.fireEvent.click(wrapper.getByTitle('Edit'))

    expect(edit).toHaveBeenCalledTimes(1)
    expect(edit).toHaveBeenCalledWith(lock.address)
  })

  it('should display a confirming label when withdrawal is confirming', () => {
    config.requiredConfirmations = 12
    withdrawalTransaction = {
      status: 'mined',
      confirmations: 2,
      withdrawal: 'lockwithdrawalconfirmingid',
    }

    store = createUnlockStore({})

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
