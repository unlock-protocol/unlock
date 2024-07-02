import { locksmith } from '~/config/locksmith'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@unlock-protocol/ui'
import { Event } from '@unlock-protocol/core'
import { config } from '~/config/app'
import { useLockManager } from '~/hooks/useLockManager'

export interface StakeRefundProps {
  event: Event
  refundsToApprove: any
}

export const SetKickbackContractAsLockManager = ({
  event,
  refundsToApprove,
}: StakeRefundProps) => {
  console.log(refundsToApprove)

  const { kickbackAddress } = config.networks[event.attendeeRefund!.network]

  const x = useLockManager({
    lockAddress,
    network,
    lockManagerAddress: kickbackAddress,
  })

  return (
    <>
      <Button>Set as Manager</Button>
    </>
  )
}

export const SaveRootForRefunds = ({ refundsToApprove }: StakeRefundProps) => {
  return (
    <>
      <Button>Save Root</Button>
    </>
  )
}

export const StakeRefund = ({ event }: StakeRefundProps) => {
  const {
    isLoading: isLoadingRefunds,
    mutate: approveRefunds,
    data: refundsToApprove,
  } = useMutation(async () => {
    const response = await locksmith.approveRefunds(
      event.slug,
      event.attendeeRefund!
    )
    return response.data
  })

  if (refundsToApprove) {
    return (
      <>
        <p>
          At this point, {refundsToApprove.list.length} attendees have been
          checked-in and could claim a refund, if you approve them.
        </p>
        <ul className="flex">
          <li>
            <SetKickbackContractAsLockManager
              event={event}
              refundsToApprove={refundsToApprove}
            />
          </li>
          <li>
            <SaveRootForRefunds
              event={event}
              refundsToApprove={refundsToApprove}
            />
          </li>
        </ul>
      </>
    )
  }
  return (
    <Button loading={isLoadingRefunds} onClick={() => approveRefunds()}>
      Prepare Refund
    </Button>
  )
}
