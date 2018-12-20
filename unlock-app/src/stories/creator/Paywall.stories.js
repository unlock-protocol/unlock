import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import Paywall from '../../pages/paywall'
import createUnlockStore from '../../createUnlockStore'

const lock = {
  address: '0x56781234a',
  keyPrice: '10000000000000000000',
  expirationDuration: '86400',
  maxNumberOfKeys: '800',
  outstandingKeys: '32',
}

const store = createUnlockStore({
  locks: {
    '0x56781234a': lock,
    '0x12345678a': {
      address: '0x12345678a',
      name: 'My Blog',
      keyPrice: '27000000000000000',
      expirationDuration: '172800',
      maxNumberOfKeys: 240,
      outstandingKeys: 3,
    },
  },
})

storiesOf('Paywall', Paywall)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('the paywall overlay', () => {
    return <Paywall lock={lock} />
  })
