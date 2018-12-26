import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import Demo from '../../pages/demo'
import createUnlockStore from '../../createUnlockStore'

const myLock = {
  address: '0xaaaaaaaaa0c4d48d1bdad5dcb26153fc8780f83e',
  name: 'My Blog',
  keyPrice: '27000000000000000',
  expirationDuration: '172800',
  maxNumberOfKeys: 240,
  outstandingKeys: 3,
}
const store = createUnlockStore({
  locks: {
    '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e': {
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      keyPrice: '10000000000000000000',
      expirationDuration: '86400',
      maxNumberOfKeys: 800,
      outstandingKeys: 32,
    },
    '0xaaaaaaaaa0c4d48d1bdad5dcb26153fc8780f83e': myLock,
  },
  router: {
    location: {
      pathname: '/demo/' + myLock.address,
    },
  },
  currency: {
    USD: 195.99,
  },
})

storiesOf('Demo', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('the demo', () => {
    return <Demo />
  })
