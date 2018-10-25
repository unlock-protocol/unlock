import React from 'react'
import { storiesOf } from '@storybook/react'
import CreatorLock from '../../components/creator/CreatorLock'

storiesOf('CreatorLock', CreatorLock)
  .add('Deployed', () => {
    const lock = {
      keyPrice: '10000000000000000000',
      expirationDuration: '172800',
      maxNumberOfKeys: '240',
      outstandingKeys: '3',
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
    }
    const transaction = {
      status: 'mined',
      confirmations: 24,
    }
    return (
      <CreatorLock lock={lock} transaction={transaction}/>
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
    const transaction = {
      status: 'mined',
      confirmations: 2,
    }
    return (
      <CreatorLock lock={lock} transaction={transaction} />
    )
  })
  .add('Not found', () => {
    const lock = {
      keyPrice: '10000000000000000000',
      expirationDuration: '172800',
      maxNumberOfKeys: '240',
      outstandingKeys: '3',
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
    }
    return (
      <CreatorLock lock={lock} transaction={null} />
    )
  })
