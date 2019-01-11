import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import KeyList from '../../components/creator/lock/KeyList'
import createUnlockStore from '../../createUnlockStore'

const sampleLocks = {
  '0': {
    address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e0',
  },
  '10': {
    address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e10',
  },
  '50': {
    address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e50',
  },
  '100': {
    address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e100',
  },
  '200': {
    address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e200',
  },
}

const addSampleKeys = () => {
  const keys = {}
  Object.keys(sampleLocks).forEach((numberStr, i) => {
    const numberOfKeys = parseInt(numberStr, 10)
    Array(numberOfKeys)
      .fill()
      .forEach((_, j) => {
        keys[`${numberStr} ${j}`] = {
          id: `${numberStr} ${j}`,
          transaction: `0x${i}${j}23749328748932748932473298473289473298`,
          lock: `0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e${numberStr}`,
          expiration:
            Math.floor(new Date('Jan 8, 2019 00:00:00').getTime() / 1000) +
            86400 * 30, // 30 days from right now
          data: 'ben@unlock-protocol.com',
        }
      })
  })
  return keys
}

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
      withdrawal: 'withdrawalconfirmingaddress',
    },
    withdrawalsubmittedid: {
      status: 'submitted',
      confirmations: 0,
      withdrawal: 'withdrawalsubmittedaddress',
    },
  },
  keys: addSampleKeys(),
  currency: {
    USD: 195.99,
  },
})

storiesOf('KeyList', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('0 keys', () => {
    return <KeyList lock={sampleLocks['0']} />
  })
  .add('10 keys', () => {
    return <KeyList lock={sampleLocks['10']} />
  })
  .add('50 keys', () => {
    return <KeyList lock={sampleLocks['50']} />
  })
  .add('100 keys', () => {
    return <KeyList lock={sampleLocks['100']} />
  })
  .add('200 keys', () => {
    return <KeyList lock={sampleLocks['200']} />
  })
