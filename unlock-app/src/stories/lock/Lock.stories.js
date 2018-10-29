import React from 'react'
import { storiesOf } from '@storybook/react'
import { Lock } from '../../components/lock/Lock'

// lock, account, keys, purchaseKey
const accessKey = {}
const purchaseKey = () => { }
const lock = {
  address: '0x123',
  name: 'Weekly Lock',
  keyPrice: '1203120301203013000',
  fiatPrice: 240.38,
}

storiesOf('Lock', Lock)
  .add('with no accessKey', () => {
    return (
      <Lock lock={lock} transaction={null} accessKey={null} purchaseKey={purchaseKey} />
    )
  })
  .add('with no key for that account on this lock', () => {
    return (
      <Lock lock={lock} transaction={null} accessKey={accessKey} purchaseKey={purchaseKey} />
    )
  })
  .add('with a pending key (not yet mined)', () => {
    const k = {
      lockAddress: lock.address,
    }
    const t = {
      status: 'submitted',
    }
    return (
      <Lock lock={lock} transaction={t} accessKey={k} purchaseKey={purchaseKey} />
    )
  })
  .add('with a mined key (which was not confirmed).', () => {
    const k = {
      lockAddress: lock.address,
    }
    const t = {
      status: 'mined',
      confirmations: 3,
    }
    return (
      <Lock lock={lock} transaction={t} accessKey={k} purchaseKey={purchaseKey} />
    )
  })
