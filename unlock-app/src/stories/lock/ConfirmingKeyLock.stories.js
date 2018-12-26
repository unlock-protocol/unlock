import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import createUnlockStore from '../../createUnlockStore'
import { ConfirmingKeyLock } from '../../components/lock/ConfirmingKeyLock'

const lock = {
  address: '0x123',
  name: 'Monthly',
  keyPrice: '1203120301203013000',
  fiatPrice: 240.38,
}

const transaction = {
  confirmations: 3,
}

const config = {
  requiredConfirmations: 6,
}

const store = createUnlockStore({
  currency: {
    USD: 195.99,
  },
})

storiesOf('ConfirmingKeyLock', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('waiting for confirmation', () => {
    return (
      <ConfirmingKeyLock
        lock={lock}
        transaction={transaction}
        config={config}
      />
    )
  })
