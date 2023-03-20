import { SubgraphService } from '@unlock-protocol/unlock-js'
import { secondsAsDays } from '~/utils/durations'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface LockSettingsProps {
  lockAddress: string
  network: number
}

export function useLockSettings() {
  const web3Service = useWeb3Service()
  const subgraph = new SubgraphService()

  const getIsRecurringPossible = async ({
    lockAddress,
    network,
  }: LockSettingsProps) => {
    const lock = await subgraph.lock(
      {
        where: {
          address_in: [lockAddress],
        },
      },
      {
        network,
      }
    )
    const refund = await await web3Service.refundPenaltyBasisPoints({
      lockAddress,
      network,
    })

    const isRecurringPossible =
      lock?.expirationDuration != -1 &&
      lock?.version >= 10 &&
      lock?.tokenAddress?.length > 0 &&
      refund > 0

    // 1 year of recurring payments
    const oneYearRecurring = Math.floor(
      365 / Number(secondsAsDays(lock.expirationDuration))
    )

    return {
      refund,
      isRecurringPossible,
      oneYearRecurring,
    }
  }

  return {
    getIsRecurringPossible,
  }
}
