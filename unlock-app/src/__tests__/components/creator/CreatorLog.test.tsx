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
    href: 'http://www.this_is_my_href.com/',
    readableName: 'Lock Creation',
  },
}

let wrapper: rtl.RenderResult<typeof rtl.queries>

afterEach(rtl.cleanup)
describe('CreatorLog', () => {
  beforeEach(() => {
    wrapper = rtl.render(
      <CreatorLog
        transactionFeed={transactionFeed}
        transactionMetadata={transactionMetadata} />
    )
  })
  it('should show the blockNumber of the transaction', () => {
    expect.assertions(1)
    expect(wrapper.queryByText('1205')).not.toBeNull()
  })

  it('should show the lock address, which is a link containing the href', () => {
    const { queryByText, container } = wrapper
    expect.assertions(2)
    expect(queryByText('0x456')).not.toBeNull()
    const link = container.querySelector('a')
    if (link) {
      expect(link.href).toBe('http://www.this_is_my_href.com/')
    }
  })

  it('should show the transaction type in readable form', () => {
    expect.assertions(2)
    expect(wrapper.queryByText(UnlockTypes.TransactionType.LOCK_CREATION)).toBeNull()
    expect(wrapper.queryByText('Lock Creation')).not.toBeNull()
  })
})
