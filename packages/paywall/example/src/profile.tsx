import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { Paywall } from '../../'
import { networks } from '@unlock-protocol/networks'
import { useMemo } from 'react'

export function Profile() {
  const { address, isConnected } = useAccount()
  const provider = useMemo(() => {
    const paywall = new Paywall(networks)
    return paywall.getProvider('http://localhost:3000') // Replace me with the URL of your Unlock instance
  }, [])

  const { connect } = useConnect({
    connector: new InjectedConnector({
      options: {
        name: 'Unlock Paywall Provider',
        getProvider: () => {
          return provider
        },
      },
    }),
  })

  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <div>
        Connected to {address}
        <button
          onClick={() => {
            disconnect()
          }}
        >
          Disconnect
        </button>
      </div>
    )
  }
  return (
    <button
      onClick={() => {
        connect()
      }}
    >
      Connect
    </button>
  )
}
