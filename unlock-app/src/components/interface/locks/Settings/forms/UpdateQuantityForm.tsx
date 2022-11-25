import { useMutation } from '@tanstack/react-query'
import { ToggleSwitch, Input, Button } from '@unlock-protocol/ui'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { UNLIMITED_KEYS_COUNT, MAX_UINT } from '~/constants'
import { useWalletService } from '~/utils/withWalletService'

interface UpdateQuantityFormProps {
  maxNumberOfKeys: number
  lockAddress: string
  isManager: boolean
  disabled: boolean
}

interface EditFormProps {
  maxNumberOfKeys?: number
  unlimitedQuantity: boolean
}

export const UpdateQuantityForm = ({
  lockAddress,
  maxNumberOfKeys,
  isManager,
  disabled,
}: UpdateQuantityFormProps) => {
  const [unlimitedQuantity, setUnlimitedQuantity] = useState(false)
  const walletService = useWalletService()

  useEffect(() => {
    setUnlimitedQuantity(UNLIMITED_KEYS_COUNT === maxNumberOfKeys)
  }, [maxNumberOfKeys])

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    setValue,
    formState: { isValid, errors },
  } = useForm<EditFormProps>({
    mode: 'onChange',
    defaultValues: {
      maxNumberOfKeys,
      unlimitedQuantity,
    },
  })

  const updateQuantity = async (): Promise<any> => {
    const { unlimitedQuantity, maxNumberOfKeys } = getValues()

    const numbersOfKeys = unlimitedQuantity ? MAX_UINT : maxNumberOfKeys

    return await walletService.setMaxNumberOfKeys({
      lockAddress,
      maxNumberOfKeys: numbersOfKeys as any,
    } as any)
  }

  const updateQuantityMutation = useMutation(updateQuantity)

  const onHandleSubmit = async () => {
    if (isValid) {
      await ToastHelper.promise(updateQuantityMutation.mutateAsync(), {
        loading: 'Updating quantity...',
        success: 'Quantity updated',
        error: `We could not update the amount of memberships for sale for this lock.`,
      })
    } else {
      ToastHelper.error('Form is not valid')
      reset()
    }
  }

  const defaultMaxNumberOfKeys =
    maxNumberOfKeys == UNLIMITED_KEYS_COUNT ? '' : maxNumberOfKeys

  const disabledInput = disabled || updateQuantityMutation.isLoading
  return (
    <form
      className="flex flex-col gap-6 text-left"
      onSubmit={handleSubmit(onHandleSubmit)}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <label className="block px-1 mb-4 text-base" htmlFor="">
            Number of memberships for sale:
          </label>
          <ToggleSwitch
            title="Unlimited"
            enabled={unlimitedQuantity}
            setEnabled={setUnlimitedQuantity}
            disabled={disabledInput}
            onChange={(enabled: boolean) => {
              setValue('unlimitedQuantity', enabled)
              setUnlimitedQuantity(enabled)
              setValue(
                'maxNumberOfKeys',
                enabled ? undefined : (defaultMaxNumberOfKeys as number),
                {
                  shouldValidate: true,
                }
              )
            }}
          />
        </div>
        <div className="relative">
          <Input
            placeholder="Enter quantity"
            type="numeric"
            autoComplete="off"
            step={1}
            disabled={unlimitedQuantity || disabledInput}
            error={
              errors?.maxNumberOfKeys &&
              'Please choose a number of memberships for sale for your lock.'
            }
            {...register('maxNumberOfKeys', {
              min: 0,
              required: !unlimitedQuantity,
            })}
          />
        </div>
      </div>

      {isManager && (
        <Button
          type="submit"
          className="w-full md:w-1/3"
          disabled={disabledInput}
          loading={updateQuantityMutation.isLoading}
        >
          Update
        </Button>
      )}
    </form>
  )
}
