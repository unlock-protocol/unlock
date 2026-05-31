import { useMutation } from '@tanstack/react-query'
import { Button, ToastHelper } from '@unlock-protocol/ui'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { DEFAULT_USER_ACCOUNT_ADDRESS } from '~/constants'
import { useCustomHook } from '~/hooks/useCustomHooks'
import { useProvider } from '~/hooks/useProvider'
import { getAccessCodeHookAddress } from '~/utils/accessCodes'
import { useConfig } from '~/utils/withConfig'
import { HooksFormProps } from './UpdateHooksForm'
import { PasswordCappedContractHook } from './hooksComponents/PasswordCappedContractHook'
import { PromoCodeHook } from './hooksComponents/PromoCodeHook'

interface UpdateAccessCodesFormProps {
  disabled: boolean
  isPaidLock: boolean
  lockAddress: string
  network: number
  version?: bigint
}

export const UpdateAccessCodesForm = ({
  disabled,
  isPaidLock,
  lockAddress,
  network,
  version,
}: UpdateAccessCodesFormProps) => {
  const { networks } = useConfig()
  const { getWalletService } = useProvider()
  const { getHookValues, isPending, refetch, values } = useCustomHook({
    lockAddress,
    network,
    version,
  })

  const hookAddress = getAccessCodeHookAddress(networks?.[network], isPaidLock)

  const codeType = isPaidLock ? 'discount codes' : 'passwords'

  const methods = useForm<HooksFormProps>({
    defaultValues: async () => getHookValues(),
  })

  const { register, reset, watch } = methods
  const currentKeyPurchaseHook = watch('keyPurchase')
  const accessCodeHookIsActive = currentKeyPurchaseHook === hookAddress
  const replacesExistingHook =
    !!currentKeyPurchaseHook &&
    currentKeyPurchaseHook !== DEFAULT_USER_ACCOUNT_ADDRESS &&
    !accessCodeHookIsActive

  useEffect(() => {
    if (values) {
      reset(values)
    }
  }, [reset, values])

  const setKeyPurchaseHook = async (keyPurchase: string) => {
    const values = await getHookValues()

    if (values.keyPurchase === keyPurchase) {
      return
    }

    const walletService = await getWalletService(network)

    await ToastHelper.promise(
      walletService.setEventHooks({
        lockAddress,
        keyPurchase,
      }),
      {
        success: 'Access codes enabled.',
        loading: 'Updating the purchase hook...',
        error: 'Failed to update the purchase hook.',
      }
    )
  }

  const setEventsHooksMutation = useMutation({
    mutationFn: async ({ keyPurchase }: Partial<HooksFormProps>) => {
      if (!keyPurchase) return
      await setKeyPurchaseHook(keyPurchase)
    },
    onSuccess: async () => {
      const values = await getHookValues()
      reset(values)
      refetch()
    },
  })

  if (version === undefined) {
    return (
      <p className="text-sm text-brand-dark">Loading access code settings...</p>
    )
  }

  if (version < BigInt(7)) {
    return (
      <p className="text-sm text-brand-dark">
        Access codes require PublicLock version 7 or later. Upgrade this lock to
        use this shortcut.
      </p>
    )
  }

  if (!hookAddress) {
    return (
      <p className="text-sm text-brand-dark">
        Access codes are not available on this network.
      </p>
    )
  }

  if (disabled) {
    return (
      <p className="text-sm text-brand-dark">
        Only lock managers can update access codes.
      </p>
    )
  }

  return (
    <FormProvider {...methods}>
      <div className="grid gap-4">
        <p className="text-sm text-brand-dark">
          {isPaidLock
            ? 'Create discount codes that buyers can enter during checkout.'
            : 'Create password-protected access codes for this free lock.'}
        </p>
        {replacesExistingHook && (
          <p className="text-sm text-amber-700">
            Enabling {codeType} will replace the current purchase hook on this
            lock.
          </p>
        )}
        {!accessCodeHookIsActive ? (
          <Button
            className="w-full md:w-fit"
            disabled={disabled || isPending}
            loading={setEventsHooksMutation.isPending}
            onClick={() =>
              setEventsHooksMutation.mutate({ keyPurchase: hookAddress })
            }
            size="small"
          >
            Enable {codeType}
          </Button>
        ) : isPaidLock ? (
          <>
            <input type="hidden" {...register('keyPurchase')} />
            <PromoCodeHook
              disabled={disabled}
              hookAddress={hookAddress}
              lockAddress={lockAddress}
              name="keyPurchase"
              network={network}
              setEventsHooksMutation={setEventsHooksMutation}
            />
          </>
        ) : (
          <>
            <input type="hidden" {...register('keyPurchase')} />
            <PasswordCappedContractHook
              disabled={disabled}
              hookAddress={hookAddress}
              lockAddress={lockAddress}
              name="keyPurchase"
              network={network}
              setEventsHooksMutation={setEventsHooksMutation}
            />
          </>
        )}
      </div>
    </FormProvider>
  )
}
