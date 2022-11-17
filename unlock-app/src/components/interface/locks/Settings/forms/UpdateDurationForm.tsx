import { useMutation } from '@tanstack/react-query'
import { ToggleSwitch, Input, Button } from '@unlock-protocol/ui'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import {
  UNLIMITED_KEYS_DURATION,
  ONE_DAY_IN_SECONDS,
  MAX_UINT,
} from '~/constants'
import { useWalletService } from '~/utils/withWalletService'

interface UpdateDurationFormProps {
  lockAddress: string
  network: number
  duration: number
  isManager: boolean
  disabled: boolean
}
export const UpdateDurationForm = ({
  lockAddress,
  duration,
  isManager,
  disabled,
}: UpdateDurationFormProps) => {
  const [unlimitedDuration, setUnlimitedDuration] = useState(
    duration === UNLIMITED_KEYS_DURATION
  )
  const walletService = useWalletService()
  const durationInDays = Math.round(
    parseInt(`${duration ?? 0}`, 10) / ONE_DAY_IN_SECONDS
  )

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { isValid, errors },
    setValue,
  } = useForm<any>({
    mode: 'onChange',
    defaultValues: {
      unlimitedDuration,
      expirationDuration: durationInDays,
    },
  })

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

  const updateDurationMutation = useMutation(updateDuration, {
    onSuccess: () => {
      const { unlimitedDuration, expirationDuration } = getValues()
      setValue('expirationDuration', expirationDuration)
      setValue('unlimitedDuration', unlimitedDuration)
    },
  })

  const onHandleSubmit = async () => {
    if (isValid) {
      await ToastHelper.promise(updateDurationMutation.mutateAsync(), {
        loading: 'Updating duration...',
        success: 'Duration updated',
        error: 'We could not update the duration for this lock.',
      })
    } else {
      ToastHelper.error('Form is not valid')
      reset()
    }
  }
  return (
    <form
      className="flex flex-col gap-6 text-left"
      onSubmit={handleSubmit(onHandleSubmit)}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <label className="block px-1 text-base" htmlFor="">
            Memberships duration (days):
          </label>
          <ToggleSwitch
            title="Unlimited"
            enabled={unlimitedDuration}
            setEnabled={setUnlimitedDuration}
            disabled={disabled}
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
            disabled={unlimitedDuration || disabled}
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

      {isManager && (
        <Button
          type="submit"
          className="w-full md:w-1/2"
          disabled={updateDurationMutation.isLoading}
        >
          Update
        </Button>
      )}
    </form>
  )
}
