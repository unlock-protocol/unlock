import { useQuery } from '@tanstack/react-query'
import { Badge, Button, ToggleSwitch } from '@unlock-protocol/ui'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { MAX_UINT } from '~/constants'
import useLock from '~/hooks/useLock'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface SubscriptionFormProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
  lock?: any
}

export const SubscriptionForm = ({
  lockAddress,
  network,
  isManager,
  disabled,
  lock,
}: SubscriptionFormProps) => {
  const web3Service = useWeb3Service()
  const [isLoading, setLoading] = useState(false)
  const [recurring, setRecurring] = useState(false)
  const [isRecurring, setIsRecurring] = useState(false)

  console.log('lock', lock)

  const { updateSelfAllowance } = useLock(
    {
      address: lockAddress,
      network,
    },
    network
  )

  const getRefundPenaltyBasisPoints = async () => {
    return await web3Service.refundPenaltyBasisPoints({
      lockAddress,
      network,
    })
  }

  const { isLoading: isLoadingRefund, data: refund = 0 } = useQuery(
    ['getRefundPenaltyBasisPoints', lockAddress, network],
    async () => {
      return await getRefundPenaltyBasisPoints()
    }
  )

  const recurringPossible =
    lock?.expirationDuration != -1 &&
    lock?.publicLockVersion >= 10 &&
    lock?.currencyContractAddress?.length > 0 &&
    refund > 0

  useEffect(() => {
    setRecurring(isRecurring)
  }, [isRecurring])

  useEffect(() => {
    if (lock?.publicLockVersion >= 11) {
      // TODO: check gas refund
      setIsRecurring(recurringPossible)
    } else {
      setIsRecurring(recurringPossible && lock?.selfAllowance !== '0')
    }
  }, [lock?.publicLockVersion, lock?.selfAllowance, recurringPossible])

  const handleApproveRecurring = () => {
    if (!isManager) return null
    // We only need to do this for older versions
    if (lock?.publicLockVersion < 11) {
      setLoading(true)
      updateSelfAllowance(MAX_UINT, () => {
        setIsRecurring(true)
        setLoading(false)
      })
    } else {
      setIsRecurring(true)
    }
  }

  if (isRecurring) {
    return (
      <Badge variant="green" className="flex justify-center w-full md:w-1/3">
        <span>Recurring enabled</span>
      </Badge>
    )
  }

  const RecurringDescription = () => {
    const termsSettingsUrl = `/locks/settings?address=${lockAddress}&network=${network}&defaultTab=terms`

    if (recurringPossible) return null

    if (lock?.publicLockVersion >= 10) {
      return (
        <div className="grid  gap-1.5">
          <small className="text-sm text-brand-dark">
            Recurring memberships are only available for locks that are using
            and ERC20 currency and that have expirations and a refund value.
          </small>
          <ul className="ml-2 list-disc">
            {refund === 0 && (
              <li>
                <span className="text-red-500">
                  Refund value is not set. You can change it from{' '}
                  <Link
                    href={termsSettingsUrl}
                    className="font-semibold text-brand-ui-primary hover:underline"
                  >
                    Membership terms settings.
                  </Link>{' '}
                </span>
              </li>
            )}
            {lock?.expirationDuration == -1 && (
              <li>
                <span className="text-red-500">
                  This lock does not have an expiration. You can change it from{' '}
                  <Link
                    href={termsSettingsUrl}
                    className="font-semibold text-brand-ui-primary hover:underline"
                  >
                    Membership terms settings.
                  </Link>
                </span>
              </li>
            )}
            {(lock?.currencyContractAddress ?? '')?.length === 0 && (
              <li>
                <span className="text-red-500">
                  {`This lock does not have a custom ERC20 contract address. You
                  can change it from "Price" tab.`}
                </span>
              </li>
            )}
          </ul>
        </div>
      )
    }

    return null
  }

  const disabledInput =
    isRecurring ||
    !recurringPossible ||
    disabled ||
    isLoading ||
    isLoadingRefund

  return (
    <div className="flex flex-col gap-6">
      <ToggleSwitch
        title="Enable recurring"
        description={<RecurringDescription />}
        disabled={disabledInput}
        enabled={recurring}
        setEnabled={setRecurring}
      />
      {isManager && (
        <Button
          disabled={disabledInput}
          className="w-full md:w-1/2"
          onClick={handleApproveRecurring}
          loading={isLoading || isLoadingRefund}
        >
          Apply
        </Button>
      )}
    </div>
  )
}
