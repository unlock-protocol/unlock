import React, { useContext, useMemo } from 'react'
import { ApolloProvider, useQuery } from '@apollo/react-hooks'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'
import keyHolderQuery from '../../../queries/keyHolder'
import 'cross-fetch/polyfill'
import { DefaultError } from '../../creator/FatalError'
import Loading from '../Loading'
import { OwnedKey } from './KeychainTypes'
import Key from './Key'
import LoginPrompt from '../LoginPrompt'
import networks from '@unlock-protocol/networks'
import ApolloClient from 'apollo-boost'
import { NetworkConfig } from '@unlock-protocol/types'

interface KeysByNetworkProps {
  account: string
  network: NetworkConfig
}
export const KeysByNetwork = ({ account, network }: KeysByNetworkProps) => {
  const { loading, error, data } = useQuery(keyHolderQuery(), {
    variables: { address: account },
  })

  const { name, id } = network

  const [keyHolders] = data?.keyHolders ?? []
  const { keys } = keyHolders ?? []
  const hasKeys = keys?.length == 0

  if (loading) {
    return (
      <div className="flex flex-col mb-3">
        <div className="h-[1.2rem] w-[17rem] bg-slate-200 mb-2"></div>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div className="h-[250px] rounded-xl bg-slate-200 animate-pulse"></div>
          <div className="h-[250px] rounded-xl bg-slate-200 animate-pulse"></div>
          <div className="h-[250px] rounded-xl bg-slate-200 animate-pulse"></div>
          <div className="h-[250px] rounded-xl bg-slate-200 animate-pulse"></div>
          <div className="h-[250px] rounded-xl bg-slate-200 animate-pulse"></div>
          <div className="h-[250px] rounded-xl bg-slate-200 animate-pulse"></div>
          <div className="h-[250px] rounded-xl bg-slate-200 animate-pulse"></div>
          <div className="h-[250px] rounded-xl bg-slate-200 animate-pulse"></div>
          <div className="h-[250px] rounded-xl bg-slate-200 animate-pulse"></div>
        </div>
      </div>
    )
  }
  if (hasKeys || loading) return null
  if (error) {
    return (
      <DefaultError
        title="Could not retrieve keys"
        illustration="/images/illustrations/error.svg"
        critical
      >
        {error.message}
      </DefaultError>
    )
  }

  return (
    <div className="flex flex-col mb-[2rem]">
      <div className="flex flex-col">
        <small className="font-semibold uppercase text-gray-300 text-[10px] tracking-[.4px] mb-[.5px]">
          network
        </small>
        <span className="font-semibold text-lg mb-3">{name}</span>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {keys.map((key: OwnedKey) => (
          <Key key={key.id} ownedKey={key} account={account} network={id} />
        ))}
      </div>
    </div>
  )
}

export const KeyDetails = () => {
  const { account, network } = useContext(AuthenticationContext)

  if (!account || !network) {
    return <LoginPrompt />
  }

  return (
    <div>
      <div>
        {Object.entries(networks).map(([networkId, networkObj]) => {
          const subgraphURI = networkObj.subgraphURI
          const apolloClientByNetwork = new ApolloClient({
            uri: subgraphURI!,
          }) as any

          return (
            <div key={networkId}>
              <ApolloProvider client={apolloClientByNetwork}>
                <KeysByNetwork
                  key={networkId}
                  network={networkObj}
                  account={account}
                />
              </ApolloProvider>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default KeyDetails

export const NoKeys = () => {
  return (
    <DefaultError
      title="You don't have any keys yet"
      illustration="/images/illustrations/key.svg"
      critical={false}
    >
      The Keychain lets you view and manage the keys that you own. As soon as
      you have one, you&apos;ll see it on this page.
    </DefaultError>
  )
}
