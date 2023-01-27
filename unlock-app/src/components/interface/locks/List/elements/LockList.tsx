import { QueriesOptions, useQueries } from '@tanstack/react-query'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { Disclosure } from '@headlessui/react'
import { Lock } from '~/unlockTypes'
import { useConfig } from '~/utils/withConfig'
import { LockCard, LocksByNetworkPlaceholder } from './LockCard'
import {
  RiArrowDropUpLine as UpIcon,
  RiArrowDropDownLine as DownIcon,
} from 'react-icons/ri'

interface LocksByNetworkProps {
  network: string
  isLoading: boolean
  locks?: any[]
}

interface LockListProps {
  owner: string
}

const LocksByNetwork = ({ network, isLoading, locks }: LocksByNetworkProps) => {
  const { networks } = useConfig()
  const { name: networkName } = networks[network]

  if (isLoading) return <LocksByNetworkPlaceholder networkName={networkName} />
  if (locks?.length === 0) return null

  return (
    <div className="w-full">
      <Disclosure defaultOpen>
        {({ open }) => (
          <div className="flex flex-col gap-2">
            <Disclosure.Button className="flex items-center justify-between w-full outline-none ring-0">
              <h2 className="text-lg font-bold text-brand-ui-primary">
                {networkName}
              </h2>
              {open ? (
                <UpIcon className="fill-brand-ui-primary" size={24} />
              ) : (
                <DownIcon className="fill-brand-ui-primary" size={24} />
              )}
            </Disclosure.Button>
            <Disclosure.Panel>
              <div className="flex flex-col gap-6">
                {locks?.map((lock: Lock, index: number) => (
                  <LockCard key={index} lock={lock} network={network} />
                ))}
              </div>
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>
    </div>
  )
}

export const LockList = ({ owner }: LockListProps) => {
  const { networks } = useConfig()

  const networkItems: any[] =
    Object.entries(networks ?? {})
      // ignore localhost
      .filter(([network]) => network !== '31337') ?? []

  const getLocksByNetwork = async ({ account: owner, network }: any) => {
    const service = new SubgraphService()
    return await service.locks(
      {
        first: 1000,
        where: {
          lockManagers_contains: [owner],
        },
        orderBy: 'createdAtBlock' as any,
        orderDirection: 'desc' as any,
      },
      {
        networks: [network],
      }
    )
  }

  const queries: QueriesOptions<any>[] = networkItems.map(([network]) => {
    const lockName = networks[network]?.name
    if (owner && network) {
      return {
        queryKey: ['getLocks', network, owner],
        queryFn: async () =>
          await getLocksByNetwork({
            account: owner!,
            network,
          }),
        refetchInterval: false,
        onError: () => {
          ToastHelper.error(`Can't load locks from ${lockName} network.`)
        },
      }
    }
  })

  const results = useQueries({
    queries,
  })

  return (
    <div className="grid gap-20 mb-20">
      {networkItems.map(([network], index) => {
        const locksByNetwork: any = results?.[index]?.data || []
        const isLoading = results?.[index]?.isLoading || false

        return (
          <LocksByNetwork
            isLoading={isLoading}
            key={network}
            network={network}
            locks={locksByNetwork}
          />
        )
      })}
    </div>
  )
}
