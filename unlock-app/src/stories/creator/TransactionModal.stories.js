import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import createUnlockStore from '../../createUnlockStore'
import { TransactionModal } from '../../components/creator/TransactionModal'

let store = createUnlockStore()

storiesOf('TransactionModal')
.addDecorator(story => <Provider store={store}>{story()}</Provider>)
.add('With transaction in progress', () => {
  const transaction = {
    status: 'pending',
    confirmations: 3,
  }
  return (
    <TransactionModal transaction={transaction} />
  )
})
.add('With deployed lock', () => {
  const transaction = {
    status: 'mined',
    confirmations: 14,
    lock: {
      address: '0xabc',
    }
  }
  return (
    <TransactionModal transaction={transaction} />
  )
})
