import React from 'react'
import { storiesOf } from '@storybook/react'
import { CreatorAccount } from '../../components/creator/CreatorAccount'

storiesOf('CreatorAccount')
  .add('With no key purchased', () => {
    const account = {
      address: '0x3ca206264762caf81a8f0a843bbb850987b41e16',
    }
    const network = {
      name: 4,
    }
    return (
      <CreatorAccount network={network} account={account} />
    )
  })
