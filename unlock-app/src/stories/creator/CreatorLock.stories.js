import React from 'react'
import { storiesOf } from '@storybook/react'
import CreatorLockSaved from '../../components/creator/lock/CreatorLockSaved'
import CreatorLockConfirming from '../../components/creator/lock/CreatorLockConfirming'

storiesOf('CreatorLock')
  .add('Deployed', () => {
    const lock = {
      keyPrice: '10000000000000000000',
      expirationDuration: '172800',
      maxNumberOfKeys: '240',
      outstandingKeys: '3',
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
    }
    return (
      <CreatorLockSaved lock={lock} />
    )
  })
  .add('Confirming', () => {
    const lock = {
      keyPrice: '10000000000000000000',
      expirationDuration: '172800',
      maxNumberOfKeys: '240',
      outstandingKeys: '3',
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
    }
    return (
      <CreatorLockConfirming lock={lock} />
    )
  })
