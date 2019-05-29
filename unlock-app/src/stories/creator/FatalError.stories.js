import React from 'react'
import { storiesOf } from '@storybook/react'
import FatalError from '../../components/creator/FatalError'

storiesOf('FatalError', module)
  .add('Fallback', () => {
    return <FatalError.FallbackError />
  })
  .add('Network mismatch', () => {
    return (
      <FatalError.WrongNetwork currentNetwork="Mainnet" requiredNetworkId={4} />
    )
  })
  .add('Wallet missing', () => {
    return <FatalError.MissingProvider />
  })
  .add('Account missing', () => {
    return <FatalError.MissingAccount />
  })
  .add('Unlock not deployed', () => {
    return <FatalError.ContractNotDeployed />
  })
  .add('Provider not approved', () => {
    return <FatalError.NotEnabledInProvider />
  })
  .add('Non-critical error', () => {
    return (
      <FatalError.DefaultError title="Non-critical error" critical={false} />
    )
  })
