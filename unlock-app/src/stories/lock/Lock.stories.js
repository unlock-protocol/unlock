import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import { Lock } from '../../components/lock/Lock'
import createUnlockStore from '../../createUnlockStore'
import { ConfigContext } from '../../utils/withConfig'

// lock, account, keys, purchaseKey
const purchaseKey = () => {}
const config = {
  requiredConfirmations: 3,
}

const lock = {
  address: '0x123',
  name: 'Monthly',
  keyPrice: '1203120301203013000',
  fiatPrice: 240.38,
  expirationDuration: 2592000,
}

const soldOutLock = Object.assign(
  { maxNumberOfKeys: 1, outstandingKeys: 1 },
  lock
)

const store = createUnlockStore({
  currency: {
    USD: 195.99,
  },
})

const ConfigProvider = ConfigContext.Provider

const storyConfig = {
  requiredConfirmations: 12,
}

storiesOf('Lock', module)
  .addDecorator(getStory => (
    <ConfigProvider value={storyConfig}>{getStory()}</ConfigProvider>
  ))
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('with no key (check hover state too)', () => {
    return (
      <Lock
        lock={lock}
        transaction={null}
        lockKey={null}
        purchaseKey={purchaseKey}
        config={config}
        hideModal={() => {}}
      />
    )
  })
  .add('disabled - another lock has a pending key', () => {
    return (
      <Lock
        disabled
        lock={lock}
        transaction={null}
        lockKey={null}
        purchaseKey={purchaseKey}
        config={config}
        hideModal={() => {}}
      />
    )
  })
  .add('disabled - no keys left to sell', () => {
    return (
      <Lock
        lock={soldOutLock}
        transaction={null}
        lockKey={null}
        purchaseKey={purchaseKey}
        config={config}
        hideModal={() => {}}
      />
    )
  })
  .add('with a pending key (not yet mined)', () => {
    const k = {
      lock: lock.address,
    }
    const t = {
      status: 'submitted',
    }
    return (
      <Lock
        lock={lock}
        transaction={t}
        lockKey={k}
        purchaseKey={purchaseKey}
        config={config}
        hideModal={() => {}}
      />
    )
  })
  .add('with a mined key (which was not confirmed).', () => {
    const k = {
      lock: lock.address,
    }
    const t = {
      status: 'mined',
      confirmations: config.requiredConfirmations - 1,
    }
    return (
      <Lock
        lock={lock}
        transaction={t}
        lockKey={k}
        purchaseKey={purchaseKey}
        config={config}
        hideModal={() => {}}
      />
    )
  })
  .add('with a mined key.', () => {
    const k = {
      lock: lock.address,
    }
    const t = {
      status: 'mined',
      confirmations: config.requiredConfirmations + 1,
    }
    return (
      <Lock
        lock={lock}
        transaction={t}
        lockKey={k}
        purchaseKey={purchaseKey}
        config={config}
        hideModal={() => {}}
      />
    )
  })
  .add('with a balance', () => {
    const lockWithBalance = {
      address: '0x123',
      name: 'Monthly',
      keyPrice: '1203120301203013000',
      fiatPrice: 240.38,
      balance: 5,
    }
    return (
      <Lock
        lock={lockWithBalance}
        transaction={null}
        lockKey={null}
        purchaseKey={purchaseKey}
        config={config}
        hideModal={() => {}}
      />
    )
  })
