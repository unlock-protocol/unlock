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
      if (!attendeeRefund!.currency) {
        return `${attendeeRefund!.amount} ${networks[attendeeRefund!.network].nativeCurrency.symbol}`
      }
      const web3Service = new Web3Service(networks)
      let symbol = networks[attendeeRefund!.network].nativeCurrency.symbol
      if (attendeeRefund?.currency) {
        symbol = await web3Service.getTokenSymbol(
          attendeeRefund!.currency,
          attendeeRefund!.network
        )
      }

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
    <p className="px-6">
      This event requires attendees to stake when they register, and they will
      be refunded {refund} if they joined!
    </p>
  )
}
