import { storage } from '~/config/storage'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@unlock-protocol/ui'
import { Event } from '@unlock-protocol/core'

export interface StakeRefundProps {
  event: Event
}

export const StakeRefund = ({ event }: StakeRefundProps) => {
  const updateTransferFeeMutation = useMutation(async () => {
    storage.approveRefunds(event.slug, event.attendeeRefund) // This is a mock function to approve refunds. It will be replaced with the actual function to approve refunds in
  })

  return (
    <Button onClick={() => updateTransferFeeMutation.mutateAsync()}>
      Prepare Refund
    </Button>
  )
}
