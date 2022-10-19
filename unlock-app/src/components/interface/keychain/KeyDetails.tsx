import React, { useContext } from 'react'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'
import 'cross-fetch/polyfill'
import { DefaultError } from '../../creator/FatalError'
import Key from './Key'
import LoginPrompt from '../LoginPrompt'
import networks from '@unlock-protocol/networks'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import { useQuery } from '@tanstack/react-query'
import { ImageBar } from '../locks/Manage/elements/ImageBar'
import { useConfig } from '~/utils/withConfig'
interface KeysByNetworkProps {
  account: string
  network: number
}

export const KeysByNetwork = ({ account, network }: KeysByNetworkProps) => {
  const { networks } = useConfig()
  const networkName = networks[network]?.name
  const getKeys = async () => {
    const service = new SubgraphService()

    return await service.keys(
      {
        first: 1000,
        where: {
          owner: account,
        },
      },
      {
        networks: [`${network}`],
      }
    )
  }

  const {
    isLoading: loading,
    data: keys,
    isError,
  } = useQuery(['getKeys', network], async () => getKeys())

  const noKeys = keys?.length == 0

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
  if (noKeys || loading) return null
  if (isError) {
    return (
      <ImageBar
        description="Could not retrieve keys"
        src="/images/illustrations/img-error.svg"
      />
    )
  }
  if (!network) return null
  return (
    <div className="flex flex-col mb-[2rem]">
      <div className="flex flex-col">
        <h2 className="mb-2 text-lg font-bold text-brand-ui-primary">
          {networkName}
        </h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {keys?.map((key: any) => (
          <Key
            key={key.id}
            ownedKey={key as any}
            account={account}
            network={network}
          />
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
          if (networkObj.id === 31337) return null // ignore localhost
          return (
            <div key={networkId}>
              <KeysByNetwork
                key={networkId}
                network={networkObj.id}
                account={account}
              />
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
