import { useQuery } from '@tanstack/react-query'
import { Badge, Button, ToggleSwitch } from '@unlock-protocol/ui'
import { useState, useEffect } from 'react'
import { MAX_UINT } from '~/constants'
import useLock from '~/hooks/useLock'
import { useLockSettings } from '~/hooks/useLockSettings'
import { useTabSettings } from '..'

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
  const { setTab } = useTabSettings()
  const { getIsRecurringPossible } = useLockSettings()

  const {
    data: { gasRefund = 0, isRecurringPossible = false } = {},
    isLoading: isLoadingRefund,
  } = useQuery(
    ['getIsRecurringPossible', lockAddress, network],
    async () => {
      return await getIsRecurringPossible({ lockAddress, network })
    },
    {
      enabled: lockAddress?.length > 0 && network != null,
    }
  )

  const { updateSelfAllowance } = useLock(
    {
      address: lockAddress,
      network,
    },
    network
  )

  useEffect(() => {
    setRecurring(isRecurring)
  }, [isRecurring])

  useEffect(() => {
    if (lock?.publicLockVersion >= 11) {
      // TODO: check gas refund
      setIsRecurring(isRecurringPossible)
    } else {
      setIsRecurring(isRecurringPossible && lock?.selfAllowance !== '0')
    }
  }, [lock?.publicLockVersion, lock?.selfAllowance, isRecurringPossible])

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
    if (isLoading) return null
    if (isRecurringPossible) return null

    if (lock?.publicLockVersion >= 10) {
      return (
        <div className="grid  gap-1.5">
          <small className="text-sm text-brand-dark">
            Recurring memberships are only available for locks that are using an
            ERC20 currency for which a gas refund value is set.
          </small>
          <ul className="ml-2 list-disc">
            {gasRefund <= 0 && (
              <li>
                <span className="text-red-500">
                  Gas refund value is not set. You can change it from{' '}
                  <button
                    onClick={(event) => {
                      event.preventDefault()
                      setTab(1)
                    }}
                    className="font-semibold text-brand-ui-primary hover:underline"
                  >
                    Membership terms settings.
                  </button>
                </span>
              </li>
            )}
            {lock?.expirationDuration == -1 && (
              <li>
                <span className="text-red-500">
                  The memberships on this lock do not expire, so they cannot be
                  renewed. You can change it from{' '}
                  <button
                    onClick={(event) => {
                      event.preventDefault()
                      setTab(1)
                    }}
                    className="font-semibold text-brand-ui-primary hover:underline"
                  >
                    Membership terms settings.
                  </button>
                </span>
              </li>
            )}
            {(lock?.currencyContractAddress ?? '')?.length === 0 && (
              <li>
                <span className="text-red-500">
                  {`This lock uses the chain's default currency which cannot be used for recurring memberships. Please change to use an ERC20 current from the "Price" tab.`}
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
    !isRecurringPossible ||
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
          loading={isLoading}
        >
          Apply
        </Button>
      )}
    </div>
  )
}
