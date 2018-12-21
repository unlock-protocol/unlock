import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import createUnlockStore from '../../createUnlockStore'
import { PendingKeyLock } from '../../components/lock/PendingKeyLock'

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

storiesOf('PendingKeyLock', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('waiting for mining confirmation', () => {
    return <PendingKeyLock lock={lock} />
  })
