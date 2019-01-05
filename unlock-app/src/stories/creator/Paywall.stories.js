import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import Paywall from '../../pages/paywall'
import createUnlockStore from '../../createUnlockStore'

const lock = {
  address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
  keyPrice: '10000000000000000000',
  expirationDuration: '86400',
  maxNumberOfKeys: 800,
  outstandingKeys: 32,
}

const store = createUnlockStore({
  locks: {
    '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e': lock,
    '0xab7c74abc0c4d48d1bdad5dcb26153fc87ffffff': {
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc87ffffff',
      name: 'My Blog',
      keyPrice: '27000000000000000',
      expirationDuration: '172800',
      maxNumberOfKeys: 240,
      outstandingKeys: 3,
    },
  },
  router: {
    location: {
      pathname: '/demo/' + lock.address,
    },
  },
  currency: {
    USD: 195.99,
  },
})

storiesOf('Paywall', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('the paywall overlay', () => {
    return <Paywall />
  })
