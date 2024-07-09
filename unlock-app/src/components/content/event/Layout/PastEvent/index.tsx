import { Card } from '@unlock-protocol/ui'
import { Event } from '@unlock-protocol/core'
import { MdAssignmentLate } from 'react-icons/md'
import { useAuth } from '~/contexts/AuthenticationContext'

export const ClaimRefund = ({ event }: { event: Event }) => {
  const { account } = useAuth()
  if (!account) {
    return (
      <p>
        This event is configured to refund its attendees! Please connect your
        wallet to check if you are elligible!
      </p>
    )
  }
  // Check if user is logged in. Ask to connect if not.
  // Check if user has claimed a refund yet.
  // If they have... show a confirmation message.
  // If they have not, show a button to claim a refund.
  return <p>haha!</p>
}

export const PastEvent = ({ event }: { event: Event }) => {
  console.log(event)
  if (event.attendeeRefund) {
    return (
      <Card className="grid gap-4 mt-5 md:mt-0">
        <ClaimRefund event={event} />
      </Card>
    )
  }
  return (
    <Card className="grid gap-4 mt-5 md:mt-0">
      <p className="text-lg">
        <MdAssignmentLate className="inline" />
        This event is over. It is not possible to register for it anymore.
      </p>
    </Card>
  )
}

export default PastEvent
