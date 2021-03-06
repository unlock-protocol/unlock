import React from 'react'
import { storiesOf } from '@storybook/react'

import { Authenticate } from '../../components/interface/Authenticate'

const account = {
  address: '0x3ca206264762caf81a8f0a843bbb850987b41e16',
}
const network = {
  name: 4,
}
const unlockUserAccount = false
const config = {
  requiredNetworkId: network.name,
}
const provider = {}
const loading = false

storiesOf('Authenticate', module)
  .add('when the provider is loading', () => {
    return (
      <Authenticate
        unlockUserAccount={unlockUserAccount}
        provider={provider}
        config={config}
        network={network}
        account={account}
        loading
      >
        <p>All good!</p>
      </Authenticate>
    )
  })
  .add('when the provider has loaded and none is available', () => {
    return (
      <Authenticate
        unlockUserAccount={unlockUserAccount}
        provider={null}
        config={config}
        network={network}
        account={account}
        loading={loading}
      >
        <p>All good!</p>
      </Authenticate>
    )
  })
  .add(
    'when the provider has loaded and none is available but user accounts are enabled',
    () => {
      return (
        <Authenticate
          unlockUserAccount
          provider={null}
          config={config}
          network={network}
          account={account}
          loading={loading}
        >
          <p>All good!</p>
        </Authenticate>
      )
    }
  )
  .add(
    'when the provider has loaded and is available but there is no user',
    () => {
      return (
        <Authenticate
          unlockUserAccount
          provider={provider}
          config={config}
          network={network}
          account={null}
          loading={loading}
        >
          <p>All good!</p>
        </Authenticate>
      )
    }
  )
  .add(
    'when the provider has loaded and is available but the user is on the wrong network',
    () => {
      return (
        <Authenticate
          unlockUserAccount
          provider={provider}
          config={config}
          network={{
            name: 1337,
          }}
          account={account}
          loading={loading}
        >
          <p>All good!</p>
        </Authenticate>
      )
    }
  )
  .add('when the provider has loaded and everything is fine', () => {
    return (
      <Authenticate
        unlockUserAccount
        provider={provider}
        config={config}
        network={network}
        account={account}
        loading={loading}
      >
        <p>All good!</p>
      </Authenticate>
    )
  })
