import { useMutation } from '@tanstack/react-query'
import { Button, Input } from '@unlock-protocol/ui'
import { ethers } from 'ethers'
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

export const UpdateHooksForm = ({
  lockAddress,
  isManager,
  disabled,
  version,
}: UpdateHooksFormProps) => {
  const walletService = useWalletService()
  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm<FormProps>({
    defaultValues: {},
  })

  const isValidAddress = (address?: string) => {
    return address?.length ? ethers.utils.isAddress(address) : true
  }

  const setEventsHooks = async (fields: FormProps) => {
    await walletService.setEventHooks({
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

  const disabledInput = disabled || setEventsHooksMutation.isLoading

  return (
    <form className="grid gap-6" onSubmit={handleSubmit(onSubmit)}>
      {version && version >= 7 && (
        <>
          <Input
            {...register('keyPurchase', {
              validate: isValidAddress,
            })}
            label="Key purchase hook"
            disabled={disabledInput}
            placeholder="Contract address, for ex: 0x00000000000000000"
            error={errors?.keyPurchase && 'Enter a valid address'}
          />

          <Input
            {...register('keyCancel', {
              validate: isValidAddress,
            })}
            label="Key cancel hook"
            disabled={disabledInput}
            placeholder="Contract address, for ex: 0x00000000000000000"
            error={errors?.keyCancel && 'Enter a valid address'}
          />
        </>
      )}
      {version && version >= 9 && (
        <>
          <Input
            {...register('validKey', {
              validate: isValidAddress,
            })}
            label="Valid key hook"
            disabled={disabledInput}
            placeholder="Contract address, for ex: 0x00000000000000000"
            error={errors?.validKey && 'Enter a valid address'}
          />
          <Input
            {...register('tokenURI', {
              validate: isValidAddress,
            })}
            label="Token URI hook"
            disabled={disabledInput}
            placeholder="Contract address, for ex: 0x00000000000000000"
            error={errors?.tokenURI && 'Enter a valid address'}
          />
        </>
      )}
      {version && version >= 11 && (
        <>
          <Input
            {...register('keyTransfer', {
              validate: isValidAddress,
            })}
            label="Key transfer hook"
            disabled={disabledInput}
            placeholder="Contract address, for ex: 0x00000000000000000"
            error={errors?.keyTransfer && 'Enter a valid address'}
          />
        </>
      )}
      {version && version >= 12 && (
        <>
          <Input
            {...register('keyExtend', {
              validate: isValidAddress,
            })}
            label="Key extend hook"
            disabled={disabledInput}
            placeholder="Contract address, for ex: 0x00000000000000000"
            error={errors?.keyExtend && 'Enter a valid address'}
          />
          <Input
            {...register('keyGrant', {
              validate: isValidAddress,
            })}
            label="Key grant hook"
            disabled={disabledInput}
            placeholder="Contract address, for ex: 0x00000000000000000"
            error={errors?.keyGrant && 'Enter a valid address'}
          />
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
