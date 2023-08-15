import { useMutation } from '@tanstack/react-query'
import { Input, Button } from '@unlock-protocol/ui'
import React from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuth } from '~/contexts/AuthenticationContext'

interface UpdateMaxKeysPerAddressProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
  maxKeysPerAddress: number
  publicLockVersion?: number
}

interface FormProps {
  maxKeysPerAddress?: number
}

const DEFAULT_KEYS_PER_ADDRESS = 1
export const UpdateMaxKeysPerAddress = ({
  lockAddress,
  network,
  disabled,
  isManager,
  publicLockVersion,
  maxKeysPerAddress: maxKeysPerAddressValue = DEFAULT_KEYS_PER_ADDRESS,
}: UpdateMaxKeysPerAddressProps) => {
  const { getWalletService } = useAuth()

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { isValid, errors },
  } = useForm<FormProps>({
    mode: 'onChange',
    defaultValues: {
      maxKeysPerAddress: maxKeysPerAddressValue,
    },
  })

  const updateMaxKeysPerAddress = async (): Promise<any> => {
    if (!isManager) return
    const { maxKeysPerAddress = 1 } = getValues()
    const walletService = await getWalletService(network)
    return await walletService.setMaxKeysPerAddress({
      lockAddress,
      maxKeysPerAddress: maxKeysPerAddress.toString(),
    })
  }

  const updateMaxKeysPerAddressMutation = useMutation(updateMaxKeysPerAddress)

  const onHandleSubmit = async () => {
    if (isValid) {
      await ToastHelper.promise(updateMaxKeysPerAddressMutation.mutateAsync(), {
        loading: 'Updating max keys per address...',
        success: 'Maximum number of keys per address successfully updated',
        error: `We could not update the max keys per address for this lock.`,
      })
    } else {
      ToastHelper.error('Form is not valid')
      reset()
    }
  }

  const canUpdateMaxKeysPerAddress = (publicLockVersion ?? 0) >= 10

  const disabledInput =
    disabled ||
    updateMaxKeysPerAddressMutation.isLoading ||
    !canUpdateMaxKeysPerAddress

  const updateVersionUrl = `/locks/settings?address=${lockAddress}&network=${network}&defaultTab=advanced`

  return (
    <form
      className="flex flex-col gap-6 text-left"
      onSubmit={handleSubmit(onHandleSubmit)}
    >
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Input
            placeholder="Enter quantity"
            type="number"
            autoComplete="off"
            step={1}
            disabled={disabledInput}
            description={
              !canUpdateMaxKeysPerAddress && (
                <>
                  Update not supported with the current lock version.{' '}
                  <a
                    href={updateVersionUrl}
                    className="font-bold cursor-pointer text-brand-ui-primary"
                  >
                    Upgrade your lock to the latest version{' '}
                  </a>
                </>
              )
            }
            min={1}
            error={
              errors?.maxKeysPerAddress &&
              'Please enter a positive numeric value'
            }
            {...register('maxKeysPerAddress', {
              valueAsNumber: true,
              min: 1,
            })}
          />
        </div>
      </div>

      <span className="text-red-500"></span>

      {isManager && (
        <Button
          type="submit"
          className="w-full md:w-1/3"
          disabled={disabledInput}
          loading={updateMaxKeysPerAddressMutation.isLoading}
        >
          Update
        </Button>
      )}
    </form>
  )
}
