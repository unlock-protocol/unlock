import { useAuth } from '~/contexts/AuthenticationContext'
import useLocks from '~/hooks/useLocks'
import { Lock } from '~/unlockTypes'
import { useConfig } from '~/utils/withConfig'
import { LockCard, LockCardPlaceholder } from './LockCard'

interface LocksByNetworkProps {
  network: number
}

const LocksByNetwork = ({ network }: LocksByNetworkProps) => {
  const { account } = useAuth()
  const { networks } = useConfig()
  const { name: networkName } = networks[network]

  const { locks, loading } = useLocks(account!, network!)

  if (locks?.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-brand-ui-primary">{networkName}</h2>
      <div className="flex flex-col gap-6">
        {locks?.map((lock: Lock, index: number) => (
          <LockCard key={index} lock={lock} network={network} />
        ))}
        {loading && <LockCardPlaceholder />}
      </div>
    </div>
  )
}

export const LockList = () => {
  const { networks } = useConfig()

  return (
    <div className="grid gap-20 mb-20">
      {Object.values(networks ?? {}).map(({ id: network }: any) => {
        return <LocksByNetwork key={network} network={network} />
      })}
    </div>
  )
}
