import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import { CreatorLocks } from '../../components/creator/CreatorLocks'
import createUnlockStore from '../../createUnlockStore'
import { ConfigContext } from '../../utils/withConfig'

const lock = {
  name: 'First Lock',
  keyPrice: '0.01',
  expirationDuration: 172800,
  maxNumberOfKeys: 240,
  outstandingKeys: 3,
  address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
  transaction: 'transactionId',
}

const anotherLock = {
  name: 'Another Lock',
  keyPrice: '1',
  expirationDuration: 60 * 60 * 24 * 365,
  maxNumberOfKeys: -1,
  unlimitedKeys: true,
  outstandingKeys: 1234,
  address: '0x21cC9C438D9751A3225496F6FD1F1215C7bd5D83',
  transaction: 'anotherTransactionId',
}

const store = createUnlockStore({
  account: {
    address: '0xdeadbeef',
    balance: '0.12',
  },
  locks: [lock],
})

const config = {}

const ConfigProvider = ConfigContext.Provider

const createLock = () => {}

storiesOf('CreatorLocks', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .addDecorator(getStory => (
    <ConfigProvider value={config}>{getStory()}</ConfigProvider>
  ))
  .add('no lock', () => {
    return <CreatorLocks createLock={createLock} lockFeed={[]} />
  })
  .add('no lock, showForm', () => {
    return <CreatorLocks createLock={createLock} lockFeed={[]} showForm />
  })
  .add('single lock', () => {
    return <CreatorLocks createLock={createLock} lockFeed={[lock]} />
  })
  .add('multiple locks', () => {
    return (
      <CreatorLocks createLock={createLock} lockFeed={[lock, anotherLock]} />
    )
  })
  .add('loading with locks', () => {
    return (
      <CreatorLocks
        createLock={createLock}
        lockFeed={[lock, anotherLock]}
        loading
      />
    )
  })
  .add('loading with no lock', () => {
    return <CreatorLocks createLock={createLock} lockFeed={[]} loading />
  })
