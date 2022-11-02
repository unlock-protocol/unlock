import { Disclosure } from '@headlessui/react'
import useLocks from '~/hooks/useLocks'
import { Lock } from '~/unlockTypes'
import { useConfig } from '~/utils/withConfig'
import { LockCard, LockCardPlaceholder } from './LockCard'
import {
  RiArrowDropUpLine as UpIcon,
  RiArrowDropDownLine as DownIcon,
} from 'react-icons/ri'

interface LocksByNetworkProps {
  network: number
  owner?: string
}

interface LockListProps {
  owner?: string
}

const LocksByNetwork = ({ network, owner }: LocksByNetworkProps) => {
  const { networks } = useConfig()
  const { name: networkName } = networks[network]

  const { locks, loading } = useLocks(owner, network!)

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
                {loading && <LockCardPlaceholder />}
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

  return (
    <div className="grid gap-20 mb-20">
      {Object.values(networks ?? {}).map(({ id: network }: any) => {
        return <LocksByNetwork key={network} network={network} owner={owner} />
      })}
    </div>
  )
}
