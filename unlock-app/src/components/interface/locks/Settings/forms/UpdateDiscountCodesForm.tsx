import { HookType } from '@unlock-protocol/types'
import { ToastHelper } from '@unlock-protocol/ui'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useCustomHook } from '~/hooks/useCustomHooks'
import { useProvider } from '~/hooks/useProvider'
import { useConfig } from '~/utils/withConfig'
import { PromoCodeHook } from './hooksComponents/PromoCodeHook'

interface UpdateDiscountCodesFormProps {
  lockAddress: string
  network: number
  disabled: boolean
  version?: bigint
}

interface DiscountCodesFormProps {
  keyPurchase: string
  promo?: {
    code?: string
    discount?: number
    cap?: number
  }
}

export const UpdateDiscountCodesForm = ({
  lockAddress,
  network,
  disabled,
  version,
}: UpdateDiscountCodesFormProps) => {
  const { networks } = useConfig()
  const { getWalletService } = useProvider()
  const promoCodeHook = networks?.[network]?.hooks?.onKeyPurchaseHook?.find(
    ({ id }) => id === HookType.PROMO_CODE_CAPPED
  )
  const hasRequiredVersion = version !== undefined && version >= BigInt(7)
  const { isPending, refetch, getHookValues } = useCustomHook({
    lockAddress,
    network,
    version,
  })

  const methods = useForm<DiscountCodesFormProps>({
    mode: 'onChange',
    defaultValues: {
      keyPurchase: promoCodeHook?.address ?? '',
    },
  })

  const { register, reset, setValue } = methods

  useEffect(() => {
    if (promoCodeHook?.address) {
      setValue('keyPurchase', promoCodeHook.address, {
        shouldValidate: true,
      })
    }
  }, [promoCodeHook?.address, setValue])

  const setEventsHooks = async (
    fields: Pick<DiscountCodesFormProps, 'keyPurchase'>
  ) => {
    const values = (await getHookValues()) as Partial<DiscountCodesFormProps>

    if (values.keyPurchase === fields.keyPurchase) {
      return
    }

    const walletService = await getWalletService(network)

    await ToastHelper.promise(
      walletService.setEventHooks({
        lockAddress,
        ...fields,
      }),
      {
        success: 'Discount code hook enabled.',
        loading: 'Enabling discount codes on the contract...',
        error: 'Failed to enable discount codes.',
      }
    )
  }

  const setEventsHooksMutation = useMutation({
    mutationFn: setEventsHooks,
    onSuccess: async () => {
      await refetch()

      if (promoCodeHook?.address) {
        reset({
          keyPurchase: promoCodeHook.address,
        })
      }
    },
  })

  const disabledInput =
    disabled || setEventsHooksMutation.isPending || isPending

  if (!hasRequiredVersion) {
    return (
      <span className="text-base">
        Discount codes require PublicLock version 7 or later.
      </span>
    )
  }

  if (!promoCodeHook) {
    return (
      <span className="text-base">
        Discount codes are not available on this network yet.
      </span>
    )
  }

  return (
    <FormProvider {...methods}>
      <input type="hidden" {...register('keyPurchase')} />
      <PromoCodeHook
        name="keyPurchase"
        disabled={disabledInput}
        lockAddress={lockAddress}
        network={network}
        hookAddress={promoCodeHook.address}
        defaultValue={promoCodeHook.address}
        setEventsHooksMutation={setEventsHooksMutation}
        selectedOption={HookType.PROMO_CODE_CAPPED}
      />
    </FormProvider>
  )
}
