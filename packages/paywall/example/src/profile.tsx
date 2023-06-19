import React from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { Paywall } from '../../'
import { networks } from '@unlock-protocol/networks'
export function Profile() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })
  const { disconnect } = useDisconnect()

  if (isConnected)
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
  return (
    <button
      onClick={async () => {
        const paywall = new Paywall(
          {
            locks: {},
            callToAction: {} as any,
            network: 1,
          },
          networks
        )
        const provider = await paywall.authenticate()
        console.log(provider)
      }}
    >
      Connect Wallet
    </button>
  )
}
