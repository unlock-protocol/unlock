import React from 'react'
import { storiesOf } from '@storybook/react'
import { NetworkBadge } from '../../components/interface/NetworkBadge'

storiesOf('NetworkBadge')
  .add('with dev network', () => {
    const network = {
      name: '7331',
    }
    return (
      <NetworkBadge network={network} />
    )
  })
  .add('with rinkeby network', () => {
    const network = {
      name: '4',
    }
    return (
      <NetworkBadge network={network} />
    )
  })
  .add('with main network', () => {
    const network = {
      name: '1',
    }
    return (
      <NetworkBadge network={network} />
    )
  })