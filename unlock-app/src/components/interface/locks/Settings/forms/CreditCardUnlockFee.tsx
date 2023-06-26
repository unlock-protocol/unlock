import { ToggleSwitch } from '@unlock-protocol/ui'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { storage } from '~/config/storage'
import { useSaveLockSettings } from '~/hooks/useLockSettings'

interface CreditCardUnlockFeeFormProps {
  unlockFeeChargedToUser: boolean
}

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
  const [includeUnlockFee, setIncludeUnlockFee] = useState(false)
  const getDefaultValues = async (): Promise<CreditCardUnlockFeeFormProps> => {
    const { unlockFeeChargedToUser = true } = (
      await storage.getLockSettings(network, lockAddress)
    ).data

    setIncludeUnlockFee(unlockFeeChargedToUser)
    return {
      unlockFeeChargedToUser,
    }
  }

  const { handleSubmit } = useForm<CreditCardUnlockFeeFormProps>({
    defaultValues: async () => await getDefaultValues(),
  })

  const saveSettingMutation = useSaveLockSettings()

  const onSubmit = async () => {
    await saveSettingMutation.mutateAsync({
      lockAddress,
      network,
      unlockFeeChargedToUser: includeUnlockFee,
    })
    ToastHelper.success('Fee setting updated.')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid items-center gap-2">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-gray-700">Fees paid by lock manager</span>
          <ToggleSwitch
            disabled={disabled || saveSettingMutation.isLoading}
            enabled={includeUnlockFee}
            setEnabled={setIncludeUnlockFee}
            onChange={onSubmit}
          />
        </div>
        <div className="text-sm text-gray-700">
          {`By default, the Unlock fee is applied on top of the lock's price. As a lock manager you can also chose to cover these fees on behalf of your users. In that case, your Stripe payments will be reduced.`}
        </div>
      </div>
    </form>
  )
}
