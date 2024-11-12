import { useQuery } from '@tanstack/react-query'
import { ZeroAddress } from 'ethers'
import { UpdateGasRefundForm } from './UpdateGasRefundForm'
import useGetGasRefund from '~/hooks/useGetGasRefund'
import { Placeholder } from '@unlock-protocol/ui'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface SubscriptionFormProps {
  lockAddress: string
  network: number
  price: number
  isManager: boolean
  disabled: boolean
  lock?: any
}

export const SubscriptionForm = ({
  lockAddress,
  network,
  price,
}: SubscriptionFormProps) => {
  const web3Service = useWeb3Service()

  const { data: lock, isPending: isLoadingLock } = useQuery({
    queryKey: ['getLock', lockAddress, network],
    queryFn: async () => {
      return web3Service.getLock(lockAddress, network)
    },
  })

  const {
    data: gasRefund,
    isLoading: isLoadingRefund,
    refetch: refetchGasRefund,
  } = useGetGasRefund(lockAddress, network)

  const isFree = Number(lock?.keyPrice) === 0
  const isNative =
    !lock?.currencyContractAddress ||
    lock.currencyContractAddress === ZeroAddress
  const isExpiring =
    lock?.expirationDuration !== -1 &&
    lock?.expirationDuration < 60 * 60 * 24 * 365 * 100 // 100 years
  const hasGasRefund = !isLoadingRefund && gasRefund && Number(gasRefund) > 0

  if (isLoadingLock || isLoadingRefund) {
    return (
      <Placeholder.Root>
        <Placeholder.Line size="lg" />
        <Placeholder.Line size="sm" />
        <Placeholder.Line size="md" />
      </Placeholder.Root>
    )
  }

  if (isFree) {
    return (
      <p>
        ❌ This lock is free. Free memberships cannot be set to be recurring.
      </p>
    )
  }
  if (isNative) {
    return (
      <p>
        ❌ This lock is using a native currency. Recurring memberships are only
        available if you use an ERC20 currency, because users need to approve
        future payments.
      </p>
    )
  }
  if (!isExpiring) {
    return (
      <p>
        ❌ This lock has non-expiring memberships, which means that they cannot
        be renewed.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p>
        {!hasGasRefund && (
          <>
            ⚠️ Renewals are enabled. However they are currently not
            incentivized, which means that they may not be triggered if gas is
            too high.
          </>
        )}
        {hasGasRefund && (
          <>
            Renewals are enabled and you are incentivizing renewals with a gas
            refund.
          </>
        )}
      </p>

      <UpdateGasRefundForm
        lockAddress={lockAddress}
        network={network}
        price={price}
        onChanged={refetchGasRefund}
      />
    </div>
  )
}
