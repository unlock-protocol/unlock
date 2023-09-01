import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Input, ToggleSwitch } from '@unlock-protocol/ui'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface UpdateReferralFeeProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
}

interface FormProps {
  referralFeePercentage: number
}

const ZERO = ethers.constants.AddressZero

export const UpdateReferralFee = ({
  lockAddress,
  network,
  isManager,
  disabled,
}: UpdateReferralFeeProps) => {
  const [referralFee, setReferralFee] = useState(false)
  const web3Service = useWeb3Service()
  const { getWalletService } = useAuth()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormProps>()

  const setReferrerFee = async (fields: FormProps) => {
    const walletService = await getWalletService(network)
    await walletService.setReferrerFee({
      lockAddress,
      address: ZERO,
      feeBasisPoint: fields?.referralFeePercentage * 100,
    })
  }

  const getReferrerFees = async () => {
    return await web3Service.referrerFees({
      lockAddress,
      network,
      address: ZERO,
    })
  }

  const setReferrerFeeMutation = useMutation(setReferrerFee)

  const onSubmit = async (fields: FormProps) => {
    const setReferrerFeePromise = setReferrerFeeMutation.mutateAsync(fields)

    await ToastHelper.promise(setReferrerFeePromise, {
      loading: 'Updating referrer fee',
      error: 'Failed to update the values, please try again.',
      success: 'Referrer fee updated.',
    })
  }

  const { isLoading, data: referralFeePercentage } = useQuery(
    ['getReferrerFees', lockAddress, network, setReferrerFeeMutation.isSuccess],
    async () => getReferrerFees()
  )

  useEffect(() => {
    setValue('referralFeePercentage', (referralFeePercentage ?? 0) / 100)
    setReferralFee((referralFeePercentage ?? 0) > 0)
  }, [referralFeePercentage])

  const disabledInput =
    disabled || setReferrerFeeMutation.isLoading || isLoading

  return (
    <form className="grid gap-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-2">
        <ToggleSwitch
          title="Referrer fee %"
          enabled={referralFee}
          disabled={disabledInput}
          setEnabled={(enabled) => {
            setReferralFee(enabled)
            setValue(
              'referralFeePercentage',
              enabled ? (referralFeePercentage ?? 0) / 100 : 0
            )
          }}
        />
        <Input
          type="number"
          {...register('referralFeePercentage', {
            valueAsNumber: true,
            min: 0,
            max: 100,
          })}
          error={
            errors?.referralFeePercentage &&
            'This field accept percentage value between 0 and 100.'
          }
          disabled={disabledInput || !referralFee}
        />
      </div>
      {isManager && (
        <Button
          className="w-full md:w-1/3"
          type="submit"
          disabled={disabledInput}
          loading={setReferrerFeeMutation.isLoading}
        >
          Apply
        </Button>
      )}
    </form>
  )
}
