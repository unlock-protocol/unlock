import React from 'react'
import { storiesOf } from '@storybook/react'
import LockIconBar from '../../components/creator/lock/LockIconBar'

storiesOf('LockIconBar', LockIconBar)
  .add('LockIconBar', () => {
    const lock = {
      keyPrice: '10000000000000000000',
      expirationDuration: '172800',
      maxNumberOfKeys: '240',
      outstandingKeys: '3',
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
    }
    return (
      <LockIconBar lock={lock} />
    )
  })
