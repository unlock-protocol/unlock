import { useMutation } from '@tanstack/react-query'
import { Button, Input, ToggleSwitch } from '@unlock-protocol/ui'
import { ethers } from 'ethers'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWalletService } from '~/utils/withWalletService'

interface UpdateHooksFormProps {
  lockAddress: string
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
  isManager,
  disabled,
  version,
}: UpdateHooksFormProps) => {
  const walletService = useWalletService()
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
    resetField,
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
      resetField(field)
    }
  }

  const disabledInput = disabled || setEventsHooksMutation.isLoading

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
