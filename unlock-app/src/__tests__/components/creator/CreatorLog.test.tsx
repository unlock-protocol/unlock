import React from 'react'
import * as rtl from 'react-testing-library'

import { CreatorLog } from '../../../components/creator/CreatorLog'
import * as UnlockTypes from '../../../unlockTypes'

const transactionFeed: UnlockTypes.Transaction[] = [
  {
    status: UnlockTypes.TransactionStatus.MINED,
    confirmations: 3,
    hash: '0x123',
    name: 'empty',
    type: UnlockTypes.TransactionType.LOCK_CREATION,
    lock: '0x456',
    blockNumber: 1205,
  },
]

const emptyTransactionFeed: UnlockTypes.Transaction[] = []

const explorerLinks: { [key: string]: string } = {
  '0x123': 'http://www.this_is_my_href.com/',
}

describe('CreatorLog', () => {
  it('should show a message indicating that no transactions have been logged when none have been executed', () => {
    expect.assertions(1)
    const wrapper = rtl.render(
      <CreatorLog
        transactionFeed={emptyTransactionFeed}
        explorerLinks={explorerLinks}
        loading={false}
      />
    )

    expect(
      wrapper.getByText('Your log is empty: No transactions yet.')
    ).not.toBeNull()
  })

  it('should show the blockNumber of the transaction', () => {
    expect.assertions(1)
    const wrapper = rtl.render(
      <CreatorLog
        transactionFeed={transactionFeed}
        explorerLinks={explorerLinks}
        loading={false}
      />
    )

    expect(wrapper.queryByText('1205')).not.toBeNull()
  })

  it('should show the lock address, which is a link containing the href', () => {
    expect.assertions(2)
    const wrapper = rtl.render(
      <CreatorLog
        transactionFeed={transactionFeed}
        explorerLinks={explorerLinks}
        loading={false}
      />
    )

    const { queryByText, container } = wrapper
    expect(queryByText('0x456')).not.toBeNull()
    const link = container.querySelector('a')
    if (link) {
      expect(link.href).toBe('http://www.this_is_my_href.com/')
    }
  })

  it('should show the loading icon when transactions are being loaded', () => {
    expect.assertions(1)
    const wrapper = rtl.render(
      <CreatorLog
        transactionFeed={emptyTransactionFeed}
        explorerLinks={explorerLinks}
        loading
      />
    )

    expect(wrapper.getByText('loading')).not.toBeNull()
  })
})
