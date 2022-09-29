import { Modal, Input, Button, ToggleSwitch } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWalletService } from '~/utils/withWalletService'
import { UNLIMITED_KEYS_COUNT } from '~/constants'
import { useMutation } from 'react-query'

interface EditFormProps {
  maxNumberOfKeys?: number
  unlimitedQuantity: boolean
}

interface EditQuantityProps {
  lockAddress: string
  onUpdate?: () => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  maxNumberOfKeys?: number
}

export const UpdateQuantityModal = ({
  lockAddress,
  onUpdate,
  isOpen,
  setIsOpen,
  maxNumberOfKeys,
}: EditQuantityProps) => {
  const [unlimitedQuantity, setUnlimitedQuantity] = useState(
    maxNumberOfKeys == UNLIMITED_KEYS_COUNT
  )
  const walletService = useWalletService()

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

  useEffect(() => {
    if (!isOpen) return
    reset()
  }, [isOpen, reset])

  const updateQuantity = async (): Promise<any> => {
    const { unlimitedQuantity, maxNumberOfKeys } = getValues()

    const numbersOfKeys = unlimitedQuantity
      ? UNLIMITED_KEYS_COUNT
      : maxNumberOfKeys

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
        error: 'There is some unexpected issue, please try again',
      })
      setIsOpen(false)
      reset()
      if (typeof onUpdate === 'function') {
        onUpdate()
      }
    } else {
      ToastHelper.error('Form is not valid')
      setIsOpen(false)
      reset()
    }
  }

  const defaultMaxNumberOfKeys =
    maxNumberOfKeys == UNLIMITED_KEYS_COUNT ? '' : maxNumberOfKeys
  return (
    <>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <form
          className="flex flex-col gap-6 p-6 text-left"
          onSubmit={handleSubmit(onHandleSubmit)}
        >
          <span className="text-2xl font-bold">Update Quantity</span>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="block px-1 mb-4 text-base" htmlFor="">
                Number of memberships:
              </label>
              <ToggleSwitch
                title="Free"
                enabled={unlimitedQuantity}
                setEnabled={setUnlimitedQuantity}
                onChange={(enabled: boolean) => {
                  setValue('unlimitedQuantity', enabled)
                  setValue(
                    'maxNumberOfKeys',
                    enabled ? undefined : (defaultMaxNumberOfKeys as number)
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
                disabled={unlimitedQuantity}
                {...register('maxNumberOfKeys', {
                  min: 1,
                  required: !unlimitedQuantity,
                })}
              />
              {errors?.maxNumberOfKeys && (
                <span className="absolute -mt-1 text-xs text-red-700">
                  Please choose a number of memberships for your lock.
                </span>
              )}
            </div>
          </div>

          <Button type="submit" disabled={updateQuantityMutation.isLoading}>
            Update
          </Button>
        </form>
      </Modal>
    </>
  )
}
