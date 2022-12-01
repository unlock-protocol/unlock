import React, { useContext } from 'react'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'
import 'cross-fetch/polyfill'
import Key from './Key'
import LoginPrompt from '../LoginPrompt'
import networks from '@unlock-protocol/networks'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import { QueriesOptions, useQueries } from '@tanstack/react-query'
import { ImageBar } from '../locks/Manage/elements/ImageBar'
import { useConfig } from '~/utils/withConfig'
import { ToastHelper } from '~/components/helpers/toast.helper'

interface KeysByNetworkProps {
  account: string
  network: number
  isLoading?: boolean
  keys?: any[]
}

const KeysByNetworkPlaceholder = () => {
  return (
    <div className="flex flex-col mb-3">
      <div className="h-[1.2rem] w-[17rem] bg-slate-200 mb-2"></div>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array(9)
          .fill(null)
          .map((_, index) => {
            return (
              <div
                className="h-[250px] rounded-xl bg-slate-200 animate-pulse"
                key={index}
              ></div>
            )
          })}
      </div>
    </div>
  )
}

export const KeysByNetwork = ({
  account,
  network,
  isLoading,
  keys = [],
}: KeysByNetworkProps) => {
  const { networks } = useConfig()
  const networkName = networks[network]?.name

  const noKeys = keys?.length == 0

  if (isLoading) {
    return <KeysByNetworkPlaceholder />
  }

  if (noKeys) return null

  return (
    <div className="flex flex-col mb-[2rem]">
      <div className="flex flex-col">
        <h2 className="mb-2 text-lg font-bold text-brand-ui-primary">
          {networkName}
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
  const networkItems: any[] =
    Object.entries(networks ?? {})
      .map(([network, value]) => [parseInt(network, 10), value])
      // ignore localhost
      .filter(([network]) => network !== 31337) ?? []

  const getKeys = async (network: string) => {
    const service = new SubgraphService()

    return await service.keys(
      {
        first: 1000,
        where: {
          owner: account,
        },
      },
      {
        networks: [network],
      }
    )
  }
  const queries: QueriesOptions<any>[] = networkItems.map(([network]) => {
    const networkName = networks[network]?.name
    return {
      queryKey: ['getLocks', network, account],
      queryFn: async () => await getKeys(network),
      onError: () => {
        ToastHelper.error(`Can't load keys from ${networkName} network.`)
      },
    }
  })

  const results = useQueries({
    queries,
  })

  const isLoading = results?.some(({ isLoading }) => isLoading)
  const hasKeys = results?.some(
    ({ data = [] }: any) => (data ?? [])?.length > 0
  )

  if (!account || !network) {
    return <LoginPrompt />
  }

  if (!hasKeys && !isLoading) {
    return (
      <ImageBar
        description="You don't have any keys yet"
        src="/images/illustrations/img-error.svg"
      />
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {networkItems.map(([network], index) => {
        const keys: any = results?.[index]?.data || []
        return (
          <KeysByNetwork
            key={network}
            network={network}
            account={account}
            keys={keys}
            isLoading={isLoading}
          />
        )
      })}
    </div>
  )
}

export default KeyDetails
