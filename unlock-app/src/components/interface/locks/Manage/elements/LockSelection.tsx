'use client'

import { Button } from '@unlock-protocol/ui'
import { useSearchParams } from 'next/navigation'
import { Picker } from '~/components/interface/Picker'

interface LockSelectionProps {
  owner: string
  setLockAddress: (address: string) => void
  setNetwork: (network: string) => void
  lockAddress?: string
  network?: string
}

const LockSelection = ({
  owner,
  setLockAddress,
  setNetwork,
  lockAddress,
  network,
}: LockSelectionProps) => {
  const searchParams = useSearchParams()

  const resetLockSelection = () => {
    setLockAddress('')
    setNetwork('')
  }

  const withoutParams =
    !searchParams.get('lockAddress') &&
    !searchParams.get('network') &&
    !(lockAddress && network)

  const hasQuery =
    (searchParams.get('address') as string)?.length > 0 &&
    (searchParams.get('network') as string)?.length > 0

  return (
    <div>
      {withoutParams ? (
        <>
          <h2 className="mb-2 text-lg font-bold text-brand-ui-primary">
            Select a lock to start managing it
          </h2>
          <div className="w-1/2">
            <Picker
              userAddress={owner!}
              onChange={({ lockAddress, network }) => {
                if (lockAddress && network) {
                  setLockAddress(lockAddress)
                  setNetwork(`${network}`)
                }
              }}
            />
          </div>
        </>
      ) : (
        !hasQuery && (
          <Button onClick={resetLockSelection} variant="outlined-primary">
            Change lock
          </Button>
        )
      )}
    </div>
  )
}

export default LockSelection
