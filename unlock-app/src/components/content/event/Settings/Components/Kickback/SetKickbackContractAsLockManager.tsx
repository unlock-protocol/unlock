import { Event } from '@unlock-protocol/core'
import { Button, Placeholder } from '@unlock-protocol/ui'
import { config } from '~/config/app'
import { useLockManager } from '~/hooks/useLockManager'
import { useAddLockManager } from '~/hooks/useAddLockManager'

interface SetKickbackContractAsLockManagerProps {
  event: Event
  lockAddress: string
  network: number
}

export const SetKickbackContractAsLockManager = ({
  event,
  lockAddress,
  network,
}: SetKickbackContractAsLockManagerProps) => {
  const { kickbackAddress } = config.networks[event.attendeeRefund!.network]
  const {
    isManager,
    isPending: isLoadingLockManager,
    refetch,
  } = useLockManager({
    lockAddress,
    network,
    lockManagerAddress: kickbackAddress,
  })

  const addLockManagerMutation = useAddLockManager(lockAddress, network)

  const onAddLockManager = async () => {
    await addLockManagerMutation.mutateAsync(kickbackAddress!)
    await refetch()
  }

  if (isLoadingLockManager) {
    return (
      <div className="flex flex-col">
        <Placeholder.Root>
          <Placeholder.Line size="sm" />
          <Placeholder.Line size="sm" />
        </Placeholder.Root>
      </div>
    )
  }

  if (isManager) {
    return <p>✅ The refund contract is a manager and can issue refunds.</p>
  }

  return (
    <div className="flex flex-col">
      <p>
        ❌ To issue refunds, you will need to let a 3rd party contract withdraw
        from your lock.
      </p>
      <Button
        onClick={onAddLockManager}
        size="small"
        loading={isLoadingLockManager || addLockManagerMutation.isPending}
      >
        Approve contract as manager
      </Button>
    </div>
  )
}
