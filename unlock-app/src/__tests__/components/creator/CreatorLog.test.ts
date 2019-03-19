import React from 'react'
import * as rtl from 'react-testing-library'
import CreatorLog from '../../../components/creator/CreatorLog'
import * as UnlockTypes from '../../../unlock'

const transactionFeed: UnlockTypes.Transaction[] = [
  {
    status: 'mined',
    confirmations: 3,
    hash: '0x123',
    name: 'empty',
    type: UnlockTypes.TransactionType.LOCK_CREATION,
    lock: '0x456',
    blockNumber: 1205,
  },
]

const transactionMetadata: UnlockTypes.TransactionMetadata = {
  '0x123': {
    href: 'THIS_IS_MY_HREF',
    readableName: 'Lock Creation',
  },
}


describe('CreatorLog', () => {
  it('should show the blockNumber of the transaction', () => {
    const wrapper = rtl.render(React.createElement(CreatorLog, { transactionFeed, transactionMetadata }))
    expect.assertions(1)
    expect(wrapper.queryByText('1205')).not.toBeNull()
  })

  it('should show the lock address', () => {
    const wrapper = rtl.render(React.createElement(CreatorLog, { transactionFeed, transactionMetadata }))
    expect.assertions(1)
    expect(wrapper.queryByText('0x456')).not.toBeNull()
  })

  it('should show the transaction type in readable form', () => {
    const wrapper = rtl.render(React.createElement(CreatorLog, { transactionFeed, transactionMetadata }))
    expect.assertions(1)
    expect(wrapper.queryByText(UnlockTypes.TransactionType.LOCK_CREATION)).toBeNull()
  })
})
