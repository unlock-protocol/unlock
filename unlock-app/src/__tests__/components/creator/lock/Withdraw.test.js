import React from 'react'
import * as rtl from 'react-testing-library'

import { Withdraw } from '../../../../components/interface/buttons/lock/Withdraw'

describe('Withdraw', () => {
  it('should initiate balance withdrawal when withdraw button is clicked', () => {
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
    const withdrawFromLock = jest.fn()

    let wrapper = rtl.render(
      <Withdraw lock={keylock} withdraw={withdrawFromLock} />
    )

    let withdrawButton = wrapper.getByTitle('Withdraw balance')
    rtl.fireEvent.click(withdrawButton)

    expect(withdrawFromLock).toHaveBeenCalled()
  })
  it('should disable the button when the lock has no balance', () => {
    const keylock = {
      id: 'lockid',
      address: '0x1234567890',
      transaction: 'transactionid',
      keyPrice: '1',
      balance: '0',
      outstandingKeys: 1,
      maxNumberOfKeys: 10,
      expirationDuration: 100,
    }
    const withdrawFromLock = jest.fn()

    let wrapper = rtl.render(
      <Withdraw lock={keylock} withdraw={withdrawFromLock} />
    )

    let withdrawButton = wrapper.queryByTitle('Withdraw balance')
    expect(withdrawButton).toBeNull()
  })
  it('should disable the button when a withdrawal is in process', () => {
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
    const withdrawalTransaction = {
      status: 'submitted',
    }
    const withdrawFromLock = jest.fn()

    let wrapper = rtl.render(
      <Withdraw
        lock={keylock}
        withdraw={withdrawFromLock}
        withdrawalTransaction={withdrawalTransaction}
      />
    )

    let withdrawButton = wrapper.queryByTitle('Withdraw balance')
    expect(withdrawButton).toBeNull()
  })
})
