// TODO: delete when settings page goes online
import { Badge, Button } from '@unlock-protocol/ui'
import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MAX_UINT } from '~/constants'
import useLock from '~/hooks/useLock'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface EnableRecurringProps {
  lockAddress: string
  network: number
}

const EnableRecurringPlaceholder = () => {
  return (
    <div className="w-full h-10 rounded-full bg-slate-200 animate-pulse"></div>
  )
}

export const EnableRecurring = ({
  lockAddress,
  network,
}: EnableRecurringProps) => {
  const web3Service = useWeb3Service()
  const [isRecurring, setIsRecurring] = useState(false)
  const getLock = async () => {
    return web3Service.getLock(lockAddress, network)
  }

  const { isLoading, data: lock } = useQuery(
    ['getLock', lockAddress, network],
    async () => getLock()
  )

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
    if (lock?.publicLockVersion >= 11) {
      // TODO: check gas refund
      setIsRecurring(recurringPossible)
    } else {
      setIsRecurring(recurringPossible && lock?.selfAllowance !== '0')
    }
  }, [lock?.publicLockVersion, lock?.selfAllowance, recurringPossible])

  const handleApproveRecurring = () => {
    // We only need to do this for older versions
    if (lock?.publicLockVersion < 11) {
      updateSelfAllowance(MAX_UINT, () => {
        setIsRecurring(true)
      })
    } else {
      setIsRecurring(true)
    }
  }

  if (isLoading) return <EnableRecurringPlaceholder />

  if (isRecurring) {
    return (
      <Badge variant="green" className="flex justify-center w-full">
        <span>Recurring enabled</span>
      </Badge>
    )
  }

  return (
    <>
      <Button
        variant="outlined-primary"
        size="small"
        className="w-full"
        disabled={isRecurring || !recurringPossible || isLoading}
        onClick={handleApproveRecurring}
      >
        Enable recurring
      </Button>
      {!recurringPossible && (
        <small className="text-sm text-gray-400">
          Recurring memberships are only available for locks that are using and
          ERC20 currency and that have expirations.
        </small>
      )}
    </>
  )
}
