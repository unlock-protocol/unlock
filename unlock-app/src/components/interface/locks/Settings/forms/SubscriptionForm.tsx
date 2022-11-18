import { Badge, Button, ToggleSwitch } from '@unlock-protocol/ui'
import { useState, useEffect } from 'react'
import { MAX_UINT } from '~/constants'
import useLock from '~/hooks/useLock'

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
  const [isLoading, setLoading] = useState(false)
  const [recurring, setRecurring] = useState(false)
  const [isRecurring, setIsRecurring] = useState(false)

  const { updateSelfAllowance } = useLock(
    {
      address: lockAddress,
      network,
    },
    network
  )

  const recurringPossible =
    lock?.expirationDuration != -1 &&
    lock?.publicLockVersion >= 10 &&
    lock?.currencyContractAddress?.length > 0

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
    if (recurringPossible) return null
    return (
      <small className="text-sm text-brand-dark">
        Recurring memberships are only available for locks that are using and
        ERC20 currency and that have expirations.
      </small>
    )
  }

  const disabledInput =
    isRecurring || !recurringPossible || disabled || isLoading

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
          loading={isLoading}
        >
          Update
        </Button>
      )}
    </div>
  )
}
