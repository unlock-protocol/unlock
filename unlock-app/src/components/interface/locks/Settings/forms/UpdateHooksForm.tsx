import { useMutation, useQueries } from '@tanstack/react-query'
import { Button, Input, ToggleSwitch } from '@unlock-protocol/ui'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { DEFAULT_USER_ACCOUNT_ADDRESS } from '~/constants'
import { useWalletService } from '~/utils/withWalletService'
import { useWeb3Service } from '~/utils/withWeb3Service'

const ZERO = ethers.constants.AddressZero

interface UpdateHooksFormProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
  version?: number
}
interface FormProps {
  keyPurchase: string
  keyCancel: string
  validKey?: string
  tokenURI?: string
  keyTransfer?: string
  keyExtend?: string
  keyGrant?: string
}

type FormPropsKeys = keyof FormProps

export const UpdateHooksForm = ({
  lockAddress,
  network,
  isManager,
  disabled,
  version,
}: UpdateHooksFormProps) => {
  const walletService = useWalletService()
  const web3Service = useWeb3Service()
  const [enabledFields, setEnabledFields] = useState<Record<string, boolean>>({
    keyPurchase: false,
    keyCancel: false,
    validKey: false,
    tokenURI: false,
    keyTransfer: false,
    keyExtend: false,
    keyGrant: false,
  })
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isValid, errors },
  } = useForm<FormProps>({
    defaultValues: {},
  })

  const isValidAddress = (address?: string) => {
    return address?.length ? ethers.utils.isAddress(address) : true
  }

  const setEventsHooks = async (fields: FormProps) => {
    return await walletService.setEventHooks({
      lockAddress,
      ...fields,
    })
  }

  const setEventsHooksMutation = useMutation(setEventsHooks)

  const res = useQueries({
    queries: [
      {
        queryKey: [
          'onKeyPurchaseHook',
          lockAddress,
          network,
          setEventsHooksMutation.isSuccess,
        ],
        queryFn: async () =>
          await web3Service.onKeyPurchaseHook({
            lockAddress,
            network,
          }),
        enabled: (version ?? 0) >= 7 ?? false,
      },
      {
        queryKey: [
          'onKeyCancelHook',
          lockAddress,
          network,
          setEventsHooksMutation.isSuccess,
        ],
        queryFn: async () =>
          await web3Service.onKeyCancelHook({
            lockAddress,
            network,
          }),
        enabled: (version ?? 0) >= 7 ?? false,
      },
      {
        queryKey: [
          'onValidKeyHook',
          lockAddress,
          network,
          setEventsHooksMutation.isSuccess,
        ],
        queryFn: async () =>
          await web3Service.onValidKeyHook({
            lockAddress,
            network,
          }),
        enabled: (version ?? 0) >= 9 ?? false,
      },
      {
        queryKey: [
          'onTokenURIHook',
          lockAddress,
          network,
          setEventsHooksMutation.isSuccess,
        ],
        queryFn: async () =>
          await web3Service.onTokenURIHook({
            lockAddress,
            network,
          }),
        enabled: (version ?? 0) >= 9 ?? false,
      },
      {
        queryKey: [
          'onKeyTransferHook',
          lockAddress,
          network,
          setEventsHooksMutation.isSuccess,
        ],
        queryFn: async () =>
          await web3Service.onKeyTransferHook({
            lockAddress,
            network,
          }),
        enabled: (version ?? 0) >= 11 ?? false,
      },
      {
        queryKey: [
          'onKeyExtendHook',
          lockAddress,
          network,
          setEventsHooksMutation.isSuccess,
        ],
        queryFn: async () =>
          await web3Service.onKeyExtendHook({
            lockAddress,
            network,
          }),
        enabled: (version ?? 0) >= 12 ?? false,
      },
      {
        queryKey: [
          'onKeyGrantHook',
          lockAddress,
          network,
          setEventsHooksMutation.isSuccess,
        ],
        queryFn: async () =>
          await web3Service.onKeyGrantHook({
            lockAddress,
            network,
          }),
        enabled: (version ?? 0) >= 12 ?? false,
      },
    ],
  })

  const [
    { data: keyPurchase },
    { data: keyCancel },
    { data: validKey },
    { data: tokenURI },
    { data: keyTransfer },
    { data: keyExtend },
    { data: keyGrant },
  ] = res ?? []

  const isLoading = res?.some(({ isLoading }) => isLoading)
  const isSuccess = res?.some(({ isSuccess }) => isSuccess)

  useEffect(() => {
    if (!keyPurchase) return
    setValue('keyPurchase', keyPurchase ?? ZERO)
    setEnabledFields({
      ...enabledFields,
      keyPurchase: keyPurchase !== ZERO,
    })
  }, [keyPurchase, isSuccess])

  useEffect(() => {
    if (!keyCancel) return
    setValue('keyCancel', keyCancel ?? ZERO)
    setEnabledFields({
      ...enabledFields,
      keyCancel: keyCancel !== ZERO,
    })
  }, [keyCancel, isSuccess])

  useEffect(() => {
    if (!validKey) return
    setValue('validKey', validKey ?? ZERO)
    setEnabledFields({
      ...enabledFields,
      validKey: validKey !== ZERO,
    })
  }, [validKey, isSuccess])

  useEffect(() => {
    if (!tokenURI) return
    setValue('tokenURI', tokenURI ?? ZERO)
    setEnabledFields({
      ...enabledFields,
      tokenURI: tokenURI !== ZERO,
    })
  }, [tokenURI, isSuccess])

  useEffect(() => {
    if (!keyTransfer) return
    setValue('keyTransfer', keyTransfer ?? ZERO)
    setEnabledFields({
      ...enabledFields,
      keyTransfer: keyTransfer !== ZERO,
    })
  }, [keyTransfer, isSuccess])

  useEffect(() => {
    if (!keyExtend) return
    setValue('keyExtend', keyExtend ?? ZERO)
    setEnabledFields({
      ...enabledFields,
      keyExtend: keyExtend !== ZERO,
    })
  }, [keyExtend, isSuccess])

  useEffect(() => {
    if (!keyGrant) return
    setValue('keyGrant', keyGrant ?? ZERO)
    setEnabledFields({
      ...enabledFields,
      keyGrant: keyGrant !== ZERO,
    })
  }, [keyGrant])

  const onSubmit = async (fields: FormProps) => {
    if (isValid) {
      const setEventsHooksPromise = setEventsHooksMutation.mutateAsync(fields)
      await ToastHelper.promise(setEventsHooksPromise, {
        success: 'Event hooks updated.',
        loading: 'Updating Event hooks.',
        error: 'Impossible to update event hooks.',
      })
    } else {
      ToastHelper.error('Form is not valid')
    }
  }

  const toggleField = (field: FormPropsKeys) => {
    const fieldStatus = enabledFields[field]
    setEnabledFields({
      ...enabledFields,
      [field]: !fieldStatus,
    })

    if (fieldStatus) {
      setValue(field, DEFAULT_USER_ACCOUNT_ADDRESS)
    }
  }

  const disabledInput =
    disabled || setEventsHooksMutation.isLoading || isLoading

  return (
    <form className="grid gap-6" onSubmit={handleSubmit(onSubmit)}>
      {version && version >= 7 && (
        <>
          <div>
            <ToggleSwitch
              title="Key purchase hook"
              enabled={enabledFields?.keyPurchase}
              setEnabled={() => toggleField('keyPurchase')}
              disabled={disabledInput}
            />
            <Input
              {...register('keyPurchase', {
                validate: isValidAddress,
              })}
              disabled={disabledInput || !enabledFields?.keyPurchase}
              placeholder="Contract address, for ex: 0x00000000000000000"
              error={errors?.keyPurchase && 'Enter a valid address'}
            />
          </div>

          <div>
            <ToggleSwitch
              title="Key cancel hook"
              enabled={enabledFields?.keyCancel}
              setEnabled={() => toggleField('keyCancel')}
              disabled={disabledInput}
            />
            <Input
              {...register('keyCancel', {
                validate: isValidAddress,
              })}
              disabled={disabledInput || !enabledFields?.keyCancel}
              placeholder="Contract address, for ex: 0x00000000000000000"
              error={errors?.keyCancel && 'Enter a valid address'}
            />
          </div>
        </>
      )}
      {version && version >= 9 && (
        <>
          <div>
            <ToggleSwitch
              title="Valid key hook"
              enabled={enabledFields?.validKey}
              setEnabled={() => toggleField('validKey')}
              disabled={disabledInput}
            />
            <Input
              {...register('validKey', {
                validate: isValidAddress,
              })}
              disabled={disabledInput || !enabledFields?.validKey}
              placeholder="Contract address, for ex: 0x00000000000000000"
              error={errors?.validKey && 'Enter a valid address'}
            />
          </div>
          <div>
            <ToggleSwitch
              title="Token URI hook"
              enabled={enabledFields?.tokenURI}
              setEnabled={() => toggleField('tokenURI')}
              disabled={disabledInput}
            />
            <Input
              {...register('tokenURI', {
                validate: isValidAddress,
              })}
              disabled={disabledInput || !enabledFields?.tokenURI}
              placeholder="Contract address, for ex: 0x00000000000000000"
              error={errors?.tokenURI && 'Enter a valid address'}
            />
          </div>
        </>
      )}
      {version && version >= 11 && (
        <>
          <div>
            <ToggleSwitch
              title="Key transfer hook"
              enabled={enabledFields?.keyTransfer}
              setEnabled={() => toggleField('keyTransfer')}
              disabled={disabledInput}
            />
            <Input
              {...register('keyTransfer', {
                validate: isValidAddress,
              })}
              disabled={disabledInput || !enabledFields?.keyTransfer}
              placeholder="Contract address, for ex: 0x00000000000000000"
              error={errors?.keyTransfer && 'Enter a valid address'}
            />
          </div>
        </>
      )}
      {version && version >= 12 && (
        <>
          <div>
            <ToggleSwitch
              title="Key extend hook"
              enabled={enabledFields?.keyExtend}
              setEnabled={() => toggleField('keyExtend')}
              disabled={disabledInput}
            />
            <Input
              {...register('keyExtend', {
                validate: isValidAddress,
              })}
              disabled={disabledInput || !enabledFields?.keyExtend}
              placeholder="Contract address, for ex: 0x00000000000000000"
              error={errors?.keyExtend && 'Enter a valid address'}
            />
          </div>
          <div>
            <ToggleSwitch
              title="Key grant hook"
              enabled={enabledFields?.keyGrant}
              setEnabled={() => toggleField('keyGrant')}
              disabled={disabledInput}
            />
            <Input
              {...register('keyGrant', {
                validate: isValidAddress,
              })}
              disabled={disabledInput || !enabledFields?.keyGrant}
              placeholder="Contract address, for ex: 0x00000000000000000"
              error={errors?.keyGrant && 'Enter a valid address'}
            />
          </div>
        </>
      )}
      {isManager && (
        <Button
          className="w-full md:w-1/3"
          type="submit"
          loading={setEventsHooksMutation.isLoading}
        >
          Apply
        </Button>
      )}
    </form>
  )
}
