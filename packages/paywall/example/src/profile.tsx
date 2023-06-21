import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { Paywall } from '../../'
import { networks } from '@unlock-protocol/networks'

export function Profile() {
  const { address, isConnected } = useAccount()

  const { connect } = useConnect({
    connector: new InjectedConnector({
      options: {
        name: 'Unlock Paywall Provider',
        getProvider: () => {
          const paywall = new Paywall(networks)
          return paywall.getProvider('http://localhost:3000') // Replace me with the URL of your Unlock instance
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
