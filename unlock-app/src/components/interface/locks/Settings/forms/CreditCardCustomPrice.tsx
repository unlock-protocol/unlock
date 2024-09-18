import {
  Placeholder,
  ToggleSwitch,
  Input,
  Button,
  Select,
} from '@unlock-protocol/ui'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import {
  CREDIT_CARD_MIN_PRICE_BY_CURRENCY,
  CREDIT_CARD_MIN_USD_PRICE,
} from '~/constants'
import { useSaveLockSettings } from '~/hooks/useLockSettings'
import { SettingCardDetail } from '../elements/SettingCard'
import { formatNumber } from '~/utils/formatter'
import { locksmith } from '~/config/locksmith'
import { useUSDPricing } from '~/hooks/useUSDPricing'
import { useGetTotalCharges } from '~/hooks/usePrice'
import { PricingData } from '~/components/interface/checkout/main/Confirm/PricingData'
import { CreditCardPricingBreakdown } from '~/components/interface/checkout/main/Confirm/ConfirmCard'
import { FaHeartPulse } from 'react-icons/fa6'

interface CreditCardFormSchema {
  creditCardPrice?: string | number | null
  creditCardCurrency?: string
}

interface CreditCardCustomPriceProps {
  lockAddress: string
  network: number
  disabled: boolean
  lock: any
  currencies: string[]
  connectedStripeAccount: any
}

export default function CreditCardCustomPrice({
  lockAddress,
  network,
  disabled,
  lock,
  currencies,
  connectedStripeAccount,
}: CreditCardCustomPriceProps) {
  const [useCustomPrice, setUseCustomPrice] = useState(false)
  const [hasPriceConversion, setHasPriceConversion] = useState(false)
  const [currency, setCurrency] = useState(
    connectedStripeAccount.default_currency
  )

  const getDefaultValues = async (): Promise<CreditCardFormSchema> => {
    const settings = (await locksmith.getLockSettings(network, lockAddress))
      .data
    const {
      creditCardPrice: price,
      creditCardCurrency = connectedStripeAccount.default_currency,
    } = settings

    if (price && creditCardCurrency) {
      const priceInUsd = parseFloat(formatNumber(price / 100)).toFixed(2)
      setUseCustomPrice(true) // enable toggle because it has custom price
      setCurrency(creditCardCurrency)
      setValue('creditCardCurrency', `${creditCardCurrency}`)
      return {
        creditCardPrice: priceInUsd,
        creditCardCurrency,
      }
    }

    return {
      creditCardPrice: undefined,
      creditCardCurrency: connectedStripeAccount.default_currency,
    }
  }

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isLoading: isLoadingForm },
  } = useForm<CreditCardFormSchema>({
    defaultValues: async () => await getDefaultValues(),
  })

  const {
    mutateAsync: saveSettingMutation,
    isPending: isSaveLockSettingLoading,
  } = useSaveLockSettings()

  const { keyPrice, currencyContractAddress } = lock
  // THIS SHOULD GO AWAY!
  const { data: fiatPricing, isLoading } = useUSDPricing({
    lockAddress,
    network,
    currencyContractAddress,
    amount: parseFloat(keyPrice),
  })

  useEffect(() => {
    const pricing = fiatPricing?.usd?.amount || 0
    setHasPriceConversion(pricing > 0)
  }, [fiatPricing?.usd?.amount])

  const { data: totalCharges } = useGetTotalCharges({
    lockAddress,
    network,
  })

  console.log({ totalCharges })

  const onSaveCreditCardPrice = async ({
    creditCardPrice,
    creditCardCurrency,
  }: CreditCardFormSchema) => {
    const price = creditCardPrice
      ? parseFloat(`${creditCardPrice}`) * 100 // save price in basis points
      : null

    const savePricePromise = saveSettingMutation({
      lockAddress,
      network,
      creditCardPrice: price,
      creditCardCurrency,
    })

    await ToastHelper.promise(savePricePromise, {
      loading: 'Updating price...',
      success: 'Price updated.',
      error: 'There is some issue updating the price.',
    })
  }

  const onSubmit = (fields: CreditCardFormSchema) => {
    onSaveCreditCardPrice(fields)
  }

  if (isLoading || isLoadingForm) {
    return (
      <Placeholder.Root>
        <Placeholder.Card />
      </Placeholder.Root>
    )
  }

  const saveDisabled = isSaveLockSettingLoading || disabled
  const toggleActive =
    !hasPriceConversion || (useCustomPrice && hasPriceConversion)

  const symbol = lock?.currencySymbol

  // list of currencies for dropdown
  const currencyOptions = currencies.map((currency: string) => {
    return {
      label: `${currency.toUpperCase()}`,
      value: currency,
    }
  })

  const minPriceByCurrency =
    CREDIT_CARD_MIN_PRICE_BY_CURRENCY?.[currency?.toUpperCase()] ||
    CREDIT_CARD_MIN_USD_PRICE

  return (
    <div className="grid gap-2">
      {totalCharges && (
        <Pricing
          keyPrice={
            pricingData.total <= 0
              ? 'FREE'
              : `${formatNumber(pricingData.total).toLocaleString()} ${symbol}`
          }
          usdPrice={
            usdTotalPricing
              ? `${formatNumber(
                  usdTotalPricing
                ).toLocaleString()} ${creditCardCurrencySymbol}`
              : ''
          }
          isCardEnabled={!!creditCardEnabled}
          extra={
            !isError &&
            pricingData && (
              <CreditCardPricingBreakdown
                loading={
                  isTotalPricingDataLoading || !isTotalPricingDataFetched
                }
                total={totalCharges?.total ?? 0}
                creditCardProcessingFee={totalCharges?.creditCardProcessingFee}
                unlockServiceFee={totalCharges?.unlockServiceFee ?? 0}
                gasCosts={totalCharges?.gasCost}
                symbol={creditCardCurrencySymbol}
                unlockFeeChargedToUser={unlockFeeChargedToUser}
              />
            )
          }
        />

        // <>
        //   <PricingData
        //     network={network}
        //     lock={lock!}
        //     pricingData={totalCharges}
        //   />

        //   <CreditCardPricingBreakdown
        //     loading={false}
        //     total={totalCharges?.total ?? 0}
        //     creditCardProcessingFee={totalCharges?.creditCardProcessingFee}
        //     unlockServiceFee={totalCharges?.unlockServiceFee ?? 0}
        //     gasCosts={totalCharges?.gasCost}
        //     symbol={'$'}
        //     unlockFeeChargedToUser={true}
        //   />
        //   {totalCharges?.total}
        // </>
      )}

      <SettingCardDetail
        title={'Price for card payments'}
        description={
          hasPriceConversion && fiatPricing!.usd!.amount ? (
            <span>
              {`Your members will be charged around ${fiatPricing!.usd!.amount.toFixed(2)}, but the conversion rate for ${symbol} may vary. `}
            </span>
          ) : (
            <p className="text-sm font-semibold text-red-600">
              {`We are not able to convert ${symbol} to a fiat currency. Please set the price and currency you want to charge for card payments.`}
            </p>
          )
        }
      />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid items-center gap-3"
      >
        <ToggleSwitch
          title="Use fixed price"
          enabled={toggleActive}
          disabled={!hasPriceConversion}
          setEnabled={setUseCustomPrice}
          onChange={(enabled) => {
            if (!enabled) {
              setValue('creditCardPrice', null, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          }}
        />
        {toggleActive && (
          <div className="grid gap-2 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span>Price</span>
              <Input
                type="number"
                step="any"
                disabled={disabled}
                description="Set a fixed price in fiat currency that is charged for card payments."
                error={errors?.creditCardPrice?.message}
                {...register('creditCardPrice', {
                  valueAsNumber: true,
                  required: {
                    value: toggleActive,
                    message: 'This field is required.',
                  },
                  min: {
                    value: minPriceByCurrency,
                    message: `Price is too low for us to process credit cards. It needs to be at least ${parseFloat(
                      `${minPriceByCurrency}`
                    ).toFixed(2)}. `,
                  },
                })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span>Currency</span>
              <Select
                description="The selected currency will be used for credit card payments. (the currency is automatically updated when the selection is changed)"
                options={currencyOptions}
                disabled={disabled}
                defaultValue={currency}
                onChange={(currency) => {
                  setCurrency(`${currency}`)
                  setValue('creditCardCurrency', `${currency}`)
                }}
              />
            </div>
          </div>
        )}
        <div className="w-full md:w-1/3">
          <Button className="w-full" size="small" disabled={saveDisabled}>
            Apply
          </Button>
        </div>
      </form>
    </div>
  )
}
