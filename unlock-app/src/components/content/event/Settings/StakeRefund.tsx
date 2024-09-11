import { locksmith } from '~/config/locksmith'
import { useMutation } from '@tanstack/react-query'
import { Button, Placeholder } from '@unlock-protocol/ui'
import { Event, PaywallConfigType } from '@unlock-protocol/core'
import { SetKickbackContractAsLockManager } from './Components/Kickback/SetKickbackContractAsLockManager'
import { SaveRootForRefunds } from './Components/Kickback/SaveRootForRefunds'
import { useGetApprovedRefunds } from '~/hooks/useGetApprovedRefunds'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAttendeeRefund } from '~/hooks/useAttendeeRefund'

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

  const { data: refundAmount } = useAttendeeRefund({
    attendeeRefund: event.attendeeRefund,
  })

  const approveRefundsMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await locksmith.approveRefunds(
          event.slug,
          event.attendeeRefund!
        )
        return response.data
      } catch (error) {
        console.error(error)
        ToastHelper.error(
          'Failed to approve refunds. Please make sure you have checked-in attendees.'
        )
        throw error
      }
    },
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
          checked-in and could claim a refund, if you approve them, they will be
          able to claim {refundAmount}.
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
    <div className="flex flex-col gap-4">
      <p>
        If your event is over and you have checked-in attendees, you can issue
        refunds for them only.
      </p>
      <Button
        loading={approveRefundsMutation.isPending}
        onClick={() => approveRefundsMutation.mutateAsync()}
      >
        Prepare Refunds
      </Button>
    </div>
  )
}
