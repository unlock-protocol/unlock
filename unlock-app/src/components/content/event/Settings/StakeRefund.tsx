import { locksmith } from '~/config/locksmith'
import { useMutation } from '@tanstack/react-query'
import { Button, Placeholder } from '@unlock-protocol/ui'
import { Event, PaywallConfigType } from '@unlock-protocol/core'
import { SetKickbackContractAsLockManager } from './Components/Kickback/SetKickbackContractAsLockManager'
import { SaveRootForRefunds } from './Components/Kickback/SaveRootForRefunds'
import { useGetApprovedRefunds } from '~/hooks/useGetApprovedRefunds'

export interface StakeRefundProps {
  event: Event
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

export const StakeRefund = ({ event, checkoutConfig }: StakeRefundProps) => {
  // TODO: handle when there is more than 1 lock?
  const lockAddress = Object.keys(checkoutConfig.config.locks)[0]
  const network = (checkoutConfig.config.locks[lockAddress].network ||
    checkoutConfig.config.network)!

  const approveRefundsMutation = useMutation(async () => {
    const response = await locksmith.approveRefunds(
      event.slug,
      event.attendeeRefund!
    )
    return response.data
  })

  const {
    data: approvedRefunds,
    isLoading,
    refetch: refetchApprovedRefunds,
  } = useGetApprovedRefunds(event)

  const refundsToApprove = approvedRefunds || approveRefundsMutation.data

  if (isLoading) {
    return (
      <Placeholder.Root>
        <Placeholder.Line size="sm" />
        <Placeholder.Line size="sm" />
      </Placeholder.Root>
    )
  }
  if (refundsToApprove) {
    return (
      <div>
        <p className="mb-4">
          At this point, {refundsToApprove.values.length} attendees have been
          checked-in and could claim a refund, if you approve them.
        </p>
        <ul className="flex flex-col gap-4">
          <li className="flex">
            <SetKickbackContractAsLockManager
              event={event}
              lockAddress={lockAddress}
              network={network}
            />
          </li>
          <li className="flex">
            <SaveRootForRefunds
              event={event}
              refundsToApprove={refundsToApprove}
              lockAddress={lockAddress}
              network={network}
              approveRefundsMutation={approveRefundsMutation}
              refetchApprovedRefunds={refetchApprovedRefunds}
            />
          </li>
        </ul>
      </div>
    )
  }
  return (
    <Button
      loading={approveRefundsMutation.isLoading}
      onClick={() => approveRefundsMutation.mutateAsync()}
    >
      Prepare Refunds
    </Button>
  )
}
