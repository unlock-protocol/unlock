import { AttendeeRefundType } from '@unlock-protocol/core'
import { useAttendeeRefund } from '~/hooks/useAttendeeRefund'

interface AttendeeStakingProps {
  attendeeRefund?: AttendeeRefundType
}

export const AttendeeStaking = ({ attendeeRefund }: AttendeeStakingProps) => {
  const { data: refund } = useAttendeeRefund({ attendeeRefund })

  if (!attendeeRefund || !refund) {
    return null
  }
  return (
    <p>
      This event requires attendees to stake when they register, and they will
      be refunded {refund} if they joined!
    </p>
  )
}
