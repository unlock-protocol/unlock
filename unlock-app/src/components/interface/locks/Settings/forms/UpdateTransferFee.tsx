import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Input, ToggleSwitch } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import LoadingIcon from '~/components/interface/Loading'
import { useTransferFee } from '~/hooks/useTransferFee'

interface UpdateTransferFeeProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
  unlimitedDuration: boolean
}

interface FormProps {
  transferFeePercentage: number
}

export const UpdateTransferFee = ({
  lockAddress,
  network,
  isManager,
  disabled,
  unlimitedDuration,
}: UpdateTransferFeeProps) => {
  const [allowTransfer, setAllowTransfer] = useState(false)

  const {
    handleSubmit,
    register,
    setValue,
    formState: { isValid },
  } = useForm<FormProps>({
    defaultValues: {
      transferFeePercentage: 0,
    },
  })

  const { updateTransferFee, getTransferFeeBasisPoints } = useTransferFee({
    lockAddress,
    network,
  })

  const updateTransferFeeMutation = useMutation(updateTransferFee)

  const onSubmit = async (fields: FormProps) => {
    if (isValid) {
      const updateTransferFeePromise = updateTransferFeeMutation.mutateAsync(
        allowTransfer ? fields?.transferFeePercentage : 100
      )

      await ToastHelper.promise(updateTransferFeePromise, {
        loading: 'Updating transfer fee',
        error: 'Failed to update the values, please try again.',
        success: 'Transfer fee updated.',
      })
    } else {
      ToastHelper.error('Form is not valid.')
    }
  }

  const { isLoading, data: transferFeeBasisPoints } = useQuery(
    [
      'getTransferFeeBasisPoints',
      lockAddress,
      network,
      updateTransferFeeMutation.isSuccess,
    ],
    async () => getTransferFeeBasisPoints()
  )

  const transferFeePercentage = (transferFeeBasisPoints ?? 0) / 100
  const isTransferAllowed = transferFeePercentage < 100

  useEffect(() => {
    setValue('transferFeePercentage', transferFeePercentage)
    setAllowTransfer(isTransferAllowed)
  }, [isTransferAllowed, setValue, transferFeePercentage])

  if (isLoading) {
    return <LoadingIcon />
  }

  const disabledInput =
    disabled || isLoading || updateTransferFeeMutation.isLoading

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <ToggleSwitch
        enabled={allowTransfer}
        setEnabled={(enabled) => {
          setAllowTransfer(enabled)
          setValue('transferFeePercentage', 0)
        }}
        title="Transfer authorized"
        description={
          allowTransfer
            ? 'Members can transfer their valid key(s) to any other wallet.'
            : 'Transfers are disabled and tokens are soul-bound.'
        }
        disabled={disabledInput}
      />
      {allowTransfer && !unlimitedDuration && (
        <>
          <Input
            label="Transfer fee (%)"
            type="number"
            description="You can set up a fee when member transfer their key to another account or wallet. The fee is taken in time."
            min="0"
            max="100"
            placeholder="10%"
            disabled={disabledInput || !allowTransfer}
            {...register('transferFeePercentage', {
              valueAsNumber: true,
              min: 0,
              max: 100,
            })}
          />
        </>
      )}

      {isManager && (
        <Button
          type="submit"
          className="w-full md:w-1/3"
          disabled={disabledInput}
        >
          Apply
        </Button>
      )}
    </form>
  )
}
