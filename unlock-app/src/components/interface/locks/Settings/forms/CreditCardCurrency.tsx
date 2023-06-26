import { CurrencyType, currencies } from '@unlock-protocol/core'
import { Select } from '@unlock-protocol/ui'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { storage } from '~/config/storage'
import { useSaveLockSettings } from '~/hooks/useLockSettings'

interface CreditCardCurrencyFormProps {
  currency: keyof typeof CurrencyType
}

interface CreditCardCurrencyProps {
  lockAddress: string
  network: number
  disabled: boolean
}

export default function CreditCardCurrency({
  lockAddress,
  network,
  disabled,
}: CreditCardCurrencyProps) {
  const [currency, setCurrency] = useState('usd') // default currency is USD
  const getDefaultValues = async (): Promise<CreditCardCurrencyFormProps> => {
    const { creditCardCurrency = 'usd' } = (
      await storage.getLockSettings(network, lockAddress)
    ).data

    return {
      currency: creditCardCurrency as keyof typeof CurrencyType,
    }
  }

  const { handleSubmit } = useForm<CreditCardCurrencyFormProps>({
    defaultValues: async () => await getDefaultValues(),
  })

  const saveSettingMutation = useSaveLockSettings()

  const onSubmit = async () => {
    await saveSettingMutation.mutateAsync({
      lockAddress,
      network,
      creditCardCurrency: currency,
    })
  }

  // list of currencies for dropdown
  const currencyOptions = currencies.map(({ currency, symbol }) => {
    return {
      label: `${currency.toUpperCase()} - ${symbol}`,
      value: currency,
    }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid items-center gap-2">
      <div className="flex flex-col gap-2">
        <span className="text-base font-bold text-gray-700">Currency</span>
        <Select
          description="The selected currency will be used for credit card payments. (the currency is automatically updated when the selection is changed)"
          options={currencyOptions}
          disabled={disabled}
          defaultValue={currency}
          onChange={(currency) => {
            setCurrency(`${currency}`)
          }}
        />
      </div>
    </form>
  )
}
