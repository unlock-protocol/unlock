import React from 'react'
import { storiesOf } from '@storybook/react'
import FatalError from '../../components/creator/FatalError'

storiesOf('FatalError', module)
  .add('default', () => {
    return <FatalError.DefaultError />
  })
  .add('Network mismatch', () => {
    return (
      <FatalError.WrongNetwork
        currentNetwork="main"
        requiredNetwork="rinkeby"
      />
    )
  })
  .add('Wallet missing', () => {
    return <FatalError.MissingProvider />
  })
  .add('Account missing', () => {
    return <FatalError.MissingAccount />
  })
  .add('Non-critical error', () => {
    return (
      <FatalError.DefaultError title="Non-critical error" critical={false} />
    )
  })
