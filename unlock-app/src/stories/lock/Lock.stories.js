import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import Lock from '../../components/lock/Lock'
import createUnlockStore from '../../createUnlockStore'

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
}

const store = createUnlockStore({
  currency: {
    USD: 195.99,
  },
})

storiesOf('Lock', Lock)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('with no key (check hover state too)', () => {
    return (
      <Lock
        lock={lock}
        transaction={null}
        lockKey={null}
        purchaseKey={purchaseKey}
        config={config}
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
      />
    )
  })
  .add('with a pending key (not yet mined)', () => {
    const k = {
      lockAddress: lock.address,
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
      />
    )
  })
  .add('with a mined key (which was not confirmed).', () => {
    const k = {
      lockAddress: lock.address,
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
      />
    )
  })
