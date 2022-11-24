import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Input, ToggleSwitch } from '@unlock-protocol/ui'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWalletService } from '~/utils/withWalletService'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface UpdateTransferFeeProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
}

interface FormProps {
  transferFeePercentage: number
}

export const UpdateTransferFee = ({
  lockAddress,
  network,
  isManager,
  disabled,
}: UpdateTransferFeeProps) => {
  const web3Service = useWeb3Service()
  const walletService = useWalletService()
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

  const getTransferFeeBasisPoints = async () => {
    return await web3Service.transferFeeBasisPoints(lockAddress, network)
  }

  const updateTransferFee = async (fields: FormProps) => {
    await walletService.updateTransferFee({
      lockAddress,
      transferFeeBasisPoints: fields?.transferFeePercentage * 100,
    })
  }

  const updateTransferFeeMutation = useMutation(updateTransferFee)

  const onSubmit = async (fields: FormProps) => {
    if (isValid) {
      const updateTransferFeePromise =
        updateTransferFeeMutation.mutateAsync(fields)

      await ToastHelper.promise(updateTransferFeePromise, {
        loading: 'Updating transfer fee',
        error: 'Impossible to update transfer fee.',
        success: 'Transfer fee updated.',
      })
    } else {
      ToastHelper.error('Form is not valid.')
    }
  }

  const { isLoading, data: transferFeeBasisPoints } = useQuery(
    ['get', lockAddress, network, updateTransferFeeMutation.isSuccess],
    async () => getTransferFeeBasisPoints(),
    {
      onSuccess: (transferFeeBasisPoints: number) => {
        setValue('transferFeePercentage', transferFeeBasisPoints / 100)
        setAllowTransfer(transferFeeBasisPoints > 0)
      },
    }
  )

  const disabledInput = disabled || isLoading

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <ToggleSwitch
        enabled={allowTransfer}
        setEnabled={(enabled) => {
          setAllowTransfer(enabled)
          setValue(
            'transferFeePercentage',
            enabled ? (transferFeeBasisPoints ?? 0) / 100 : 100
          )
        }}
        title="Allow Transfer"
        description="By default, members can transfer valid Keys to any account/wallet. "
        disabled={disabledInput}
      />
      <Input
        label="Transfer fee %"
        type="numeric"
        description="You can set up a fee when member transfer their Key to another account/wallet."
        disabled={disabledInput || !allowTransfer}
        {...register('transferFeePercentage', {
          min: 0,
          max: 100,
        })}
      />
      {isManager && (
        <Button type="submit" className="w-full md:w-1/3">
          Apply
        </Button>
      )}
    </form>
  )
}
