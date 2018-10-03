import React from 'react'
import { storiesOf } from '@storybook/react'
import FatalError from '../../components/creator/FatalError'

storiesOf('FatalError', FatalError)
  .add('default', () => {
    return (
      <FatalError.DefaultError />
    )
  })
  .add('Network mismatch', () => {
    return (
      <FatalError.WrongNetwork currentNetwork='main' requiredNetwork='rinkeby' />
    )
  })
  .add('Wallet missing', () => {
    return (
      <FatalError.MissingProvider />
    )
  })
