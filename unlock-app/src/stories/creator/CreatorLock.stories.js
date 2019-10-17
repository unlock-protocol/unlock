import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import CreatorLock from '../../components/creator/CreatorLock'
import createUnlockStore from '../../createUnlockStore'
import { ConfigContext } from '../../utils/withConfig'
import { TransactionType } from '../../unlockTypes'
import configure from '../../config'

const lockWith = params => {
  const standardLock = {
    address: '0xabcdef123',
    asOf: 31337,
    balance: '0.045',
    expirationDuration: 2592000,
    keyPrice: '0.01',
    maxNumberOfKeys: 42,
    name: 'Lock Robster',
    outstandingKeys: 5,
    owner: '0xaFAEfc6dd3C9feF66f92BA838b132644451F0716',
    totalSupply: 5,
    transaction: 'defaultTransaction',
    unlimitedKeys: false,
  }

  return Object.assign(standardLock, params)
}

const withdrawalConfirmingAddress = '0xAAAAAAAAAAAAAAAAAAAAAAAAAA73289473298'
const withdrawalSubmittedAddress = '0xbbbbbbbbbbbbbbbbbbbbbbbbbb73289473298'
const store = createUnlockStore({
  transactions: {
    deployedid: {
      status: 'mined',
      confirmations: 24,
      lock: '0xBF6C4DC63B4a2cD73884552DF6FeB7cD2d48278B',
    },
    confirmingid: {
      status: 'mined',
      confirmations: 4,
      type: TransactionType.LOCK_CREATION,
      lock: '0x123456abc',
    },
    submittedid: {
      status: 'submitted',
      confirmations: 0,
      type: TransactionType.LOCK_CREATION,
      lock: '0xabcdef123',
    },
    withdrawalconfirmingid: {
      status: 'mined',
      confirmations: 2,
      withdrawal: withdrawalConfirmingAddress,
      lock: '0xfeedbabe',
      type: TransactionType.WITHDRAWAL,
    },
    withdrawalsubmittedid: {
      status: 'submitted',
      confirmations: 0,
      withdrawal: withdrawalSubmittedAddress,
      lock: '0xdefcab445',
      type: TransactionType.WITHDRAWAL,
    },
  },
  keysForLockByPage: {},
  keys: {
    keyid: {
      transaction: 'deployedid',
      lock: '0xBF6C4DC63B4a2cD73884552DF6FeB7cD2d48278B',
      expiration: Math.floor(new Date().getTime() / 1000) + 86400 * 30, // 30 days from right now
      data: 'ben@unlock-protocol.com',
    },
  },
  currency: {
    USD: 195.99,
  },
})

const config = configure()

const ConfigProvider = ConfigContext.Provider

storiesOf('CreatorLock', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .addDecorator(getStory => (
    <ConfigProvider value={config}>{getStory()}</ConfigProvider>
  ))
  .add('Submitted', () => {
    const lock = lockWith({
      transaction: 'submittedid',
      balance: '0',
      outstandingKeys: 0,
    })
    return <CreatorLock lock={lock} edit={action('edit')} />
  })
  .add('Confirming', () => {
    const lock = lockWith({
      address: '0x123456abc',
      transaction: 'confirmingid',
      balance: '0',
      outstandingKeys: 0,
    })
    return <CreatorLock lock={lock} edit={action('edit')} />
  })
  .add('Deployed', () => {
    const lock = lockWith({
      address: '0xBF6C4DC63B4a2cD73884552DF6FeB7cD2d48278B',
      transaction: 'deployedid',
    })
    return <CreatorLock lock={lock} edit={action('edit')} />
  })
  .add('Unknown ERC20 Lock', () => {
    const lock = lockWith({
      currencyContractAddress: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
    })
    return <CreatorLock lock={lock} edit={action('edit')} />
  })
  .add('Known ERC20 Lock', () => {
    const lock = lockWith({
      currencyContractAddress: config.ERC20Contract.address,
    })
    return <CreatorLock lock={lock} edit={action('edit')} />
  })
  .add('Not found', () => {
    // TODO: what is this actually supposed to test?
    const lock = {
      keyPrice: '0.01',
      expirationDuration: 172800,
      maxNumberOfKeys: 240,
      outstandingKeys: 3,
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      transaction: '0x789',
    }
    return <CreatorLock lock={lock} transaction={null} edit={action('edit')} />
  })
  .add('With key', () => {
    // TODO: not sure how to force this to have a key...
    const lock = lockWith({
      keyPrice: '0.01',
      outstandingKeys: 3,
      address: '0xBF6C4DC63B4a2cD73884552DF6FeB7cD2d48278B',
      transaction: 'deployedid',
    })
    return <CreatorLock lock={lock} edit={action('edit')} />
  })
  .add('Withdrawal submitted', () => {
    const lock = lockWith({
      address: '0xdefcab445',
    })
    return <CreatorLock lock={lock} edit={action('edit')} />
  })
  .add('Withdrawing', () => {
    const lock = lockWith({
      address: '0xfeedbabe',
    })
    return <CreatorLock lock={lock} edit={action('edit')} />
  })
