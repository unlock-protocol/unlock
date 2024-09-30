import { useQuery } from '@tanstack/react-query'
import { Placeholder, ToggleSwitch } from '@unlock-protocol/ui'
import React, { useState, useEffect } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { locksmith } from '~/config/locksmith'
import { useSaveLockSettings } from '~/hooks/useLockSettings'

interface CreditCardUnlockFeeProps {
  lockAddress: string
  network: number
  disabled: boolean
}

export default function CreditCardUnlockFee({
  lockAddress,
  network,
  disabled,
}: CreditCardUnlockFeeProps) {
  const [unlockFeePaidByLockManager, setUnlockFeePaidByLockManager] =
    useState(false)

  const { data: lockSettings, isPending } = useQuery({
    queryKey: ['getLockSettings', lockAddress, network],
    queryFn: async () => {
      return (await locksmith.getLockSettings(network, lockAddress)).data
    },
  })

  useEffect(() => {
    if (lockSettings) {
      setUnlockFeePaidByLockManager(!lockSettings.unlockFeeChargedToUser)
    }
  }, [lockSettings])

  const saveSettingMutation = useSaveLockSettings()

  const onSubmit = async (feePaidByLockManager: boolean) => {
    await saveSettingMutation.mutateAsync({
      lockAddress,
      network,
      unlockFeeChargedToUser: !feePaidByLockManager,
    })
    ToastHelper.success('Option successfully changed.')
  }

  if (isPending) {
    return (
      <Placeholder.Root>
        <Placeholder.Line />
        <Placeholder.Line />
      </Placeholder.Root>
    )
  }

  return (
    <form className="grid items-center gap-2">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-gray-700">
            Fees paid by lock manager
          </span>
          <ToggleSwitch
            disabled={disabled || saveSettingMutation.isPending}
            enabled={unlockFeePaidByLockManager}
            setEnabled={setUnlockFeePaidByLockManager}
            onChange={(feePaidByLockManager: boolean) => {
              onSubmit(feePaidByLockManager)
            }}
          />
        </div>
        <div className="text-sm text-gray-700">
          By default, the Unlock fee is applied on top of the lock&apos;s price.
          As a lock manager you can also chose to cover these fees on behalf of
          your users. In that case, your Stripe payments will be reduced.
        </div>
      </div>
    </form>
  )
}
