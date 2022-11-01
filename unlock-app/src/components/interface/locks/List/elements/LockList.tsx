import { useState } from 'react'
import useLocks from '~/hooks/useLocks'
import { Lock } from '~/unlockTypes'
import { useConfig } from '~/utils/withConfig'
import { LockCard, LockCardPlaceholder } from './LockCard'

interface LocksByNetworkProps {
  network: number
  owner?: string
}

interface LockListProps {
  owner?: string
}

const LocksByNetwork = ({ network, owner }: LocksByNetworkProps) => {
  const [showLocks, setShowLocks] = useState(true)
  const { networks } = useConfig()
  const { name: networkName } = networks[network]

  const { locks, loading } = useLocks(owner, network!)

  if (locks?.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <h2 className="text-lg font-bold text-brand-ui-primary">
          {networkName}
        </h2>
        <button
          onClick={() => setShowLocks(!showLocks)}
          className="text-base underline text-brand-ui-primary"
        >
          {showLocks ? 'Hide' : 'Show'}
        </button>
      </div>
      {showLocks && (
        <div className="flex flex-col gap-6">
          {locks?.map((lock: Lock, index: number) => (
            <LockCard key={index} lock={lock} network={network} />
          ))}
          {loading && <LockCardPlaceholder />}
        </div>
      )}
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
