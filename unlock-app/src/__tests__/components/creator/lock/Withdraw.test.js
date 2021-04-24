import React from 'react'
import * as rtl from '@testing-library/react'

import { Withdraw } from '../../../../components/interface/buttons/lock/Withdraw'

describe('Withdraw', () => {
  it.skip('should initiate balance withdrawal when withdraw button is clicked', () => {
    expect.assertions(1)
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

    const wrapper = rtl.render(
      <Withdraw lock={keylock} withdraw={withdrawFromLock} />
    )

    const withdrawButton = wrapper.getByTitle('Withdraw')
    rtl.fireEvent.click(withdrawButton)

    expect(withdrawFromLock).toHaveBeenCalled()
  })

  it('should disable the button when the lock has no balance', () => {
    expect.assertions(1)
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

    const wrapper = rtl.render(
      <Withdraw lock={keylock} withdraw={withdrawFromLock} />
    )

    const withdrawButton = wrapper.queryByTitle('Withdraw')
    expect(withdrawButton).toBeNull()
  })
})
