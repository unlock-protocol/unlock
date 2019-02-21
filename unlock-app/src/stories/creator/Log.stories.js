import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import Log, { mapStateToProps } from '../../pages/log'
import createUnlockStore from '../../createUnlockStore'
import { ConfigContext } from '../../utils/withConfig'
import { TRANSACTION_TYPES } from '../../constants'

const account = {
  address: '0x3ca206264762caf81a8f0a843bbb850987b41e16',
}
const network = {
  name: 1984,
}
const transactions = {
  '0x1234': {
    hash: '0x12345678',
    confirmations: 12,
    status: 'mined',
    lock: '0x8DE3f95E2efd3B9704ccb0d0925EC951bC78cb8B',
    blockNumber: 1,
    type: TRANSACTION_TYPES.LOCK_CREATION,
  },
  '0x5678': {
    hash: '0x56781234',
    confirmations: 4,
    status: 'mined',
    lock: '0x8DE3f95E2efd3B9704ccb0d0925EC951bC78cb8B',
    blockNumber: 2,
    type: TRANSACTION_TYPES.UPDATE_KEY_PRICE,
  },
  '0x89ab': {
    hash: '0x9abcdef0',
    confirmations: 2,
    status: 'mined',
    lock: '0xc43efE2C7116CB94d563b5A9D68F260CCc44256F',
    blockNumber: 3,
    type: TRANSACTION_TYPES.LOCK_CREATION,
  },
}

const router = {
  route: '/dashboard',
}

const currency = {
  USD: 195.99,
}

const store = createUnlockStore({
  account,
  network,
  router,
  transactions,
  currency,
})

storiesOf('Transaction Log', module).add('the log', () => (
  <Provider store={store}>
    <Log />
  </Provider>
))
