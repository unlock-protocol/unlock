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
import { useAuth } from '~/contexts/AuthenticationContext'

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
  network,
}: UpdateDurationFormProps) => {
  const [unlimitedDuration, setUnlimitedDuration] = useState(
    duration === UNLIMITED_KEYS_DURATION
  )
  const durationInDays = Math.round(
    parseInt(`${duration ?? 0}`, 10) / ONE_DAY_IN_SECONDS
  )

  const { getWalletService } = useAuth()

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

    const walletService = await getWalletService(network)
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

  const disabledInput = updateDurationMutation.isLoading || disabled
  return (
    <form
      className="flex flex-col gap-6 text-left"
      onSubmit={handleSubmit(onHandleSubmit)}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <label className="block px-1 text-base" htmlFor="">
            Membership duration (in days):
          </label>
          <ToggleSwitch
            title="Unlimited"
            enabled={unlimitedDuration}
            setEnabled={setUnlimitedDuration}
            disabled={disabledInput}
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
            min="1"
            step={1}
            disabled={unlimitedDuration || disabledInput}
            {...register('expirationDuration', {
              valueAsNumber: true,
              required: !unlimitedDuration,
              min: 0,
            })}
            placeholder="Enter duration"
            type="number"
            error={errors?.expirationDuration && 'Please enter amount of days.'}
          />
        </div>
      </div>

      {isManager && (
        <Button
          type="submit"
          className="w-full md:w-1/3"
          disabled={disabledInput}
          loading={updateDurationMutation.isLoading}
        >
          Update
        </Button>
      )}
    </form>
  )
}
