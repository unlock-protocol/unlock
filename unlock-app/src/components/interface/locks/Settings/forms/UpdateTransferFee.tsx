import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Input, ToggleSwitch } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
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

  useEffect(() => {
    setValue('transferFeePercentage', (transferFeeBasisPoints ?? 0) / 100)
    setAllowTransfer((transferFeeBasisPoints ?? 0) > 0)
  }, [transferFeeBasisPoints])

  const disabledInput =
    disabled || isLoading || updateTransferFeeMutation.isLoading

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
        label="Transfer fee (in % of time left on the membership)"
        type="number"
        description="You can set up a fee when member transfer their key to another account or wallet. The fee is taken in time. Setting 100% will disable transfers."
        disabled={disabledInput || !allowTransfer}
        {...register('transferFeePercentage', {
          min: 0,
          max: 100,
        })}
      />
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
