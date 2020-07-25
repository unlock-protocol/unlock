import React from 'react'
import { storiesOf } from '@storybook/react'
import {
  LoadingLock,
  PurchaseableLock,
  DisabledLock,
  SoldOutLock,
  InsufficientBalanceLock,
  ProcessingLock,
  ConfirmedLock,
} from '../../../components/interface/checkout/LockVariations'

const makeProps = (name) => ({
  name,
  formattedKeyPrice: '0.01 ETH',
  formattedDuration: '12 Days',
  formattedKeysAvailable: '1,300',
})

const components = {
  Loading: LoadingLock,
  Disabled: DisabledLock,
  'Sold Out': SoldOutLock,
  'Insufficient Balance': InsufficientBalanceLock,
  Purchaseable: PurchaseableLock,
  Processing: ProcessingLock,
  Confirmed: ConfirmedLock,
}

storiesOf('Lock Variations', module).add('All variations', () => {
  return (
    <div>
      {Object.keys(components).map((name) => {
        const Component = components[name]
        const props = makeProps(name)
        return <Component key={name} {...props} />
      })}
    </div>
  )
})
