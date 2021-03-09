import React from 'react'
import { storiesOf } from '@storybook/react'

import { Account } from '../../components/interface/Account'

storiesOf('Account', module)
  .add('With no key purchased', () => {
    const account = {
      address: '0x3ca206264762caf81a8f0a843bbb850987b41e16',
    }
    const network = {
      name: 4,
    }
    return <Account />
  })
  .add('With balance', () => {
    const account = {
      address: '0x3ca206264762caf81a8f0a843bbb850987b41e16',
      balance: '200',
    }
    const network = {
      name: 4,
    }
    return <Account />
  })
