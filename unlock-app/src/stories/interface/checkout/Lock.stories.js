import React from 'react'
import { storiesOf } from '@storybook/react'
import { Lock, LoadingLock } from '../../../components/interface/checkout/Lock'

storiesOf('Checkout Lock', module)
  .add('Loading', () => {
    return <LoadingLock />
  })
  .add('Active', () => {
    return <Lock />
  })
