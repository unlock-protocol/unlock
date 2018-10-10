import React from 'react'
import { storiesOf } from '@storybook/react'
import CreatorLockForm from '../../components/creator/CreatorLockForm'

storiesOf('CreatorLockForm', CreatorLockForm)
  .add('Default', () => {
    return (<CreatorLockForm />)
  })
  .add('With existing lock', () => {
    const lock = {
      keyPrice: '10000000000000000000',
      expirationDuration: '172800',
      maxNumberOfKeys: '240',
      outstandingKeys: '3',
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      name: 'Existing Lock',
    }
    return (<CreatorLockForm lock={lock} />)
  })
