import { locksmith } from '~/config/locksmith'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@unlock-protocol/ui'
import { Event } from '@unlock-protocol/core'

export interface StakeRefundProps {
  event: Event
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
    ) // This is a mock function to approve refunds. It will be replaced with the actual function to approve refunds in
    console.log(response)
    return response.data
  })

  console.log(refundsToApprove)
  if (refundsToApprove) {
    return (
      <>
        <p>Cool you now have to approve refunds. 2 transactions will be sent</p>
        <ul>
          <li>first, you need to set the refund contract to be a manager</li>
          <li>then, you need to "save" the merkle proof for the refunds</li>
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
