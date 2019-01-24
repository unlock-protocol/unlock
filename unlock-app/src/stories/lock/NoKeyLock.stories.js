import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import createUnlockStore from '../../createUnlockStore'
import { NoKeyLock } from '../../components/lock/NoKeyLock'

const lock = {
  address: '0x123',
  name: 'Monthly',
  keyPrice: '1203120301203013000',
  fiatPrice: 240.38,
  expirationDuration: 2345798,
}

const store = createUnlockStore({
  currency: {
    USD: 195.99,
  },
})

storiesOf('NoKeyLock', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('ready for purchase', () => {
    return <NoKeyLock lock={lock} purchaseKey={() => {}} />
  })
