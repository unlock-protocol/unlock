import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'

import { Account } from '../../components/interface/Account'
import createUnlockStore from '../../createUnlockStore'

const store = createUnlockStore({
  currency: {
    USD: 195.99,
  },
})

storiesOf('Account', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('With no key purchased', () => {
    const account = {
      address: '0x3ca206264762caf81a8f0a843bbb850987b41e16',
    }
    const network = {
      name: 4,
    }
    return <Account network={network} account={account} />
  })
  .add('With balance', () => {
    const account = {
      address: '0x3ca206264762caf81a8f0a843bbb850987b41e16',
      balance: '200',
    }
    const network = {
      name: 4,
    }
    return <Account network={network} account={account} />
  })
