import { Modal, Input, Button, ToggleSwitch } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWalletService } from '~/utils/withWalletService'
import { useMutation } from 'react-query'
import {
  MAX_UINT,
  ONE_DAY_IN_SECONDS,
  UNLIMITED_KEYS_DURATION,
} from '~/constants'

interface EditFormProps {
  expirationDuration?: string | number
  unlimitedDuration?: boolean
}

interface UpdateDurationModalProps {
  lockAddress: string
  onUpdate?: () => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  duration?: number
}

export const UpdateDurationModal = ({
  lockAddress,
  onUpdate,
  isOpen,
  setIsOpen,
  duration,
}: UpdateDurationModalProps) => {
  const [unlimitedDuration, setUnlimitedDuration] = useState(
    duration == UNLIMITED_KEYS_DURATION
  )
  const walletService = useWalletService()
  const durationInDays = parseInt(`${(duration ?? 0) / ONE_DAY_IN_SECONDS}`)

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { isValid, errors },
    setValue,
  } = useForm<EditFormProps>({
    mode: 'onChange',
    defaultValues: {
      unlimitedDuration,
      expirationDuration: durationInDays,
    },
  })

  useEffect(() => {
    if (!isOpen) return
    reset()
  }, [isOpen, reset])

  const updateDuration = async (): Promise<any> => {
    const { unlimitedDuration, expirationDuration: duration } = getValues()

    const expirationInSeconds = parseInt(`${duration}`) * ONE_DAY_IN_SECONDS
    const expirationDuration = unlimitedDuration
      ? MAX_UINT
      : expirationInSeconds

    return await walletService.setExpirationDuration({
      lockAddress,
      expirationDuration: expirationDuration!,
    } as any)
  }

  const updateDurationMutation = useMutation(updateDuration)

  const onHandleSubmit = async () => {
    if (isValid) {
      await ToastHelper.promise(updateDurationMutation.mutateAsync(), {
        loading: 'Updating duration...',
        success: 'Duration updated',
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

  return (
    <>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <form
          className="flex flex-col gap-6 p-6 text-left"
          onSubmit={handleSubmit(onHandleSubmit)}
        >
          <span className="text-2xl font-bold">Update Duration</span>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="block px-1 text-base" htmlFor="">
                Memberships duration (days):
              </label>
              <ToggleSwitch
                title="Unlimited"
                enabled={unlimitedDuration}
                setEnabled={setUnlimitedDuration}
                onChange={(enabled: boolean) => {
                  setValue('unlimitedDuration', enabled)
                  setValue(
                    'expirationDuration',
                    enabled ? undefined : durationInDays
                  )
                }}
              />
            </div>

            <div className="relative">
              <Input
                tabIndex={0}
                autoComplete="off"
                step={0.01}
                disabled={unlimitedDuration}
                {...register('expirationDuration', {
                  required: !unlimitedDuration,
                  min: 0,
                })}
                placeholder="Enter duration"
                type="number"
              />
              {errors?.expirationDuration && (
                <span className="absolute mt-0.5 text-xs text-red-700">
                  Please enter amount of days.
                </span>
              )}
            </div>
          </div>

          <Button type="submit" disabled={updateDurationMutation.isLoading}>
            Update
          </Button>
        </form>
      </Modal>
    </>
  )
}
