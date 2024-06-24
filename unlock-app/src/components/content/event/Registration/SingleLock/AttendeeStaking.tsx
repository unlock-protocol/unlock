import { useQuery } from '@tanstack/react-query'
import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { ethers } from 'ethers'
import { AttendeeRefundType } from '@unlock-protocol/core'

interface AttendeeStakingProps {
  attendeeRefund?: AttendeeRefundType
}

export const AttendeeStaking = ({ attendeeRefund }: AttendeeStakingProps) => {
  const { data: refund } = useQuery(
    ['attendeeRefund', attendeeRefund],
    async () => {
      const web3Service = new Web3Service(networks)
      const symbol = await web3Service.getTokenSymbol(
        attendeeRefund!.currency,
        attendeeRefund!.network
      )

      return `${ethers.formatUnits(attendeeRefund!.amount, 0)} ${symbol}`
    },
    {
      enabled: !!attendeeRefund,
    }
  )

  if (!attendeeRefund) {
    return null
  }
  return (
    <p>
      This event requires attendees to stake when they register, and they will
      be refunded {refund} if they joined!
    </p>
  )
}
