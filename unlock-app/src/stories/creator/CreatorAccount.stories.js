import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'

import { CreatorAccount } from '../../components/creator/CreatorAccount'
import createUnlockStore from '../../createUnlockStore'

const store = createUnlockStore({
  currency: {
    USD: 195.99,
  },
})

storiesOf('CreatorAccount', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('With no key purchased', () => {
    const account = {
      address: '0x3ca206264762caf81a8f0a843bbb850987b41e16',
    }
    const network = {
      name: 4,
    }
    return <CreatorAccount network={network} account={account} />
  })
  .add('With balance', () => {
    const account = {
      address: '0x3ca206264762caf81a8f0a843bbb850987b41e16',
      balance: '200000000000000000',
    }
    const network = {
      name: 4,
    }
    return <CreatorAccount network={network} account={account} />
  })
