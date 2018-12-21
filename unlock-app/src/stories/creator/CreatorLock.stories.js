import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import CreatorLock from '../../components/creator/CreatorLock'
import createUnlockStore from '../../createUnlockStore'

const withdrawalConfirmingAddress = '0xAAAAAAAAAAAAAAAAAAAAAAAAAA73289473298'
const withdrawalSubmittedAddress = '0xbbbbbbbbbbbbbbbbbbbbbbbbbb73289473298'
const store = createUnlockStore({
  transactions: {
    deployedid: {
      status: 'mined',
      confirmations: 24,
    },
    confirmingid: {
      status: 'mined',
      confirmations: 4,
    },
    submittedid: {
      status: 'submitted',
      confirmations: 0,
    },
    withdrawalconfirmingid: {
      status: 'mined',
      confirmations: 2,
      withdrawal: withdrawalConfirmingAddress,
    },
    withdrawalsubmittedid: {
      status: 'submitted',
      confirmations: 0,
      withdrawal: withdrawalSubmittedAddress,
    },
  },
  keys: {
    keyid: {
      transaction: '0x23749328748932748932473298473289473298',
      lock: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      expiration: Math.floor(new Date().getTime() / 1000) + 86400 * 30, // 30 days from right now
      data: 'ben@unlock-protocol.com',
    },
  },
  currency: {
    USD: 195.99,
  },
})

storiesOf('CreatorLock', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('Deployed', () => {
    const lock = {
      keyPrice: '10000000000000000000',
      expirationDuration: 172800,
      maxNumberOfKeys: 240,
      outstandingKeys: 3,
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      transaction: 'deployedid',
    }
    return <CreatorLock lock={lock} />
  })
  .add('Submitted', () => {
    const lock = {
      keyPrice: '10000000000000000000',
      expirationDuration: 172800,
      maxNumberOfKeys: 240,
      outstandingKeys: 3,
      address: '0x127c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      transaction: 'submittedid',
    }
    return <CreatorLock lock={lock} />
  })
  .add('Confirming', () => {
    const lock = {
      keyPrice: '10000000000000000000',
      expirationDuration: 172800,
      maxNumberOfKeys: 240,
      outstandingKeys: 3,
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      transaction: 'confirmingid',
    }
    const transaction = {
      status: 'mined',
      confirmations: 2,
    }
    return <CreatorLock lock={lock} transaction={transaction} />
  })
  .add('Not found', () => {
    const lock = {
      keyPrice: '10000000000000000000',
      expirationDuration: 172800,
      maxNumberOfKeys: 240,
      outstandingKeys: 3,
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      transaction: '0x789',
    }
    return <CreatorLock lock={lock} transaction={null} />
  })
  .add('With key', () => {
    const lock = {
      keyPrice: '10000000000000000000',
      expirationDuration: 172800,
      maxNumberOfKeys: 240,
      outstandingKeys: 3,
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      transaction: 'deployedid',
    }
    const transaction = {
      status: 'mined',
      confirmations: 14,
    }
    return <CreatorLock lock={lock} transaction={transaction} />
  })
  .add('Withdrawal submitted', () => {
    const lock = {
      id: 'lockwithdrawalsubmittedid',
      keyPrice: '10000000000000000000',
      expirationDuration: 172800,
      maxNumberOfKeys: 240,
      outstandingKeys: 3,
      address: withdrawalSubmittedAddress,
      transaction: 'deployedid',
    }
    return <CreatorLock lock={lock} />
  })
  .add('Withdrawing', () => {
    const lock = {
      id: 'lockwithdrawalconfirmingid',
      keyPrice: '10000000000000000000',
      expirationDuration: 172800,
      maxNumberOfKeys: 240,
      outstandingKeys: 3,
      address: withdrawalConfirmingAddress,
      transaction: 'deployedid',
    }
    return <CreatorLock lock={lock} />
  })
