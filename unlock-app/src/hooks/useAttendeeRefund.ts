import { useQuery } from '@tanstack/react-query'
import { AttendeeRefundType } from '@unlock-protocol/core'
import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { ZeroAddress } from 'ethers'

export const useAttendeeRefund = ({
  attendeeRefund,
}: {
  attendeeRefund?: AttendeeRefundType
}) => {
  return useQuery({
    queryKey: ['attendeeRefund', attendeeRefund],
    queryFn: async () => {
      const web3Service = new Web3Service(networks)
      const networkConfig = networks[attendeeRefund!.network]

      if (
        !attendeeRefund!.currency ||
        attendeeRefund!.currency === ZeroAddress
      ) {
        return `${attendeeRefund!.amount} ${networkConfig.nativeCurrency.symbol}`
      }

      const symbol = await web3Service.getTokenSymbol(
        attendeeRefund!.currency,
        attendeeRefund!.network
      )
      return `${attendeeRefund!.amount} ${symbol}`
    },
    enabled: !!attendeeRefund,
  })
}
