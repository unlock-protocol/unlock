import { useQuery } from '@tanstack/react-query'
import { AttendeeRefundType } from '@unlock-protocol/core'
import networks from '@unlock-protocol/networks'
import { ZeroAddress } from 'ethers'
import { useWeb3Service } from '~/utils/withWeb3Service'

export const useAttendeeRefund = ({
  attendeeRefund,
}: {
  attendeeRefund?: AttendeeRefundType
}) => {
  const web3Service = useWeb3Service()

  return useQuery({
    queryKey: ['attendeeRefund', attendeeRefund],
    queryFn: async () => {
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
