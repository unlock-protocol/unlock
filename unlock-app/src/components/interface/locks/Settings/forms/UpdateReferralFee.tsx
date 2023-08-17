import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Input, ToggleSwitch, Card } from '@unlock-protocol/ui'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import LoadingIcon from '~/components/interface/Loading'
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
  referralAddress: string
}

interface ReferrerFee {
  id: string
  referrer: string
  fee: string
}

export const UpdateReferralFee = ({
  lockAddress,
  network,
  isManager,
  disabled,
}: UpdateReferralFeeProps) => {
  const [isReferralFeeEnabled, setIsReferralFeeEnabled] = useState(false)
  const [isReferralAddressEnabled, setIsReferralAddressEnabled] =
    useState(false)
  const web3Service = useWeb3Service()
  const { getWalletService } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormProps>({
    defaultValues: { referralFeePercentage: 0, referralAddress: '' },
  })

  const setReferrerFee = async (fields: FormProps) => {
    const walletService = await getWalletService(network)
    await walletService.setReferrerFee({
      lockAddress,
      address: fields?.referralAddress,
      feeBasisPoint: fields?.referralFeePercentage * 100,
    })
  }

  const getReferrerFees = async (): Promise<ReferrerFee[]> => {
    return web3Service.referrerFees({
      lockAddress,
      network,
    })
  }

  const setReferrerFeeMutation = useMutation(setReferrerFee)

  const onSubmit = async (fields: FormProps) => {
    const setReferrerFeePromise = setReferrerFeeMutation.mutateAsync({
      ...fields,
      referralAddress: ethers.utils.getAddress(
        fields.referralAddress.toLowerCase()
      ),
    })

    await ToastHelper.promise(setReferrerFeePromise, {
      loading: 'Setting new referrer',
      error: 'Failed to update the values, please try again.',
      success: 'New referrer set',
    })

    reset()
  }

  const { isLoading, data: referralFeesData } = useQuery(
    ['getReferrerFees', lockAddress, network, setReferrerFeeMutation.isSuccess],
    async () => getReferrerFees()
  )

  const referralFees = referralFeesData || []

  const isDisabledReferrerInput =
    disabled || setReferrerFeeMutation.isLoading || isLoading

  return (
    <form className="grid gap-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-2">
        <ToggleSwitch
          title="Referrer fee %"
          enabled={isReferralFeeEnabled}
          disabled={isDisabledReferrerInput}
          setEnabled={(enabled: boolean) => {
            setIsReferralFeeEnabled(enabled)
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
          disabled={isDisabledReferrerInput || !isReferralFeeEnabled}
        />
      </div>

      <div className="grid gap-2">
        <ToggleSwitch
          title="Referrer address"
          enabled={isReferralAddressEnabled}
          disabled={isDisabledReferrerInput}
          setEnabled={(enabled: boolean) => {
            setIsReferralAddressEnabled(enabled)
          }}
        />
        <Input
          type="text"
          {...register('referralAddress', {
            validate: (value) =>
              ethers.utils.isAddress(value.toLowerCase()) || 'Invalid address',
            required: {
              value: true,
              message: 'This field is required.',
            },
          })}
          error={errors?.referralAddress?.message}
          disabled={isDisabledReferrerInput || !isReferralAddressEnabled}
        />
      </div>

      {isManager && (
        <Button
          className="w-full md:w-1/3"
          type="submit"
          disabled={isDisabledReferrerInput}
          loading={setReferrerFeeMutation.isLoading}
        >
          Apply
        </Button>
      )}

      <div className="flex flex-col mt-5 items-start">
        <Card.Title>Referrers ({referralFees.length})</Card.Title>

        {isLoading ? (
          <div className="w-full flex items-center justify-center">
            <LoadingIcon />
          </div>
        ) : referralFees.length ? (
          <div className="w-full grid gap-5 grid-cols-1 mt-3">
            {referralFees.map(({ id, referrer, fee }) => {
              const feeNumber = Number(fee)

              return (
                <div
                  key={id}
                  className="w-full overflow-x-auto flex justify-between items-center border border-gray-300 p-3 rounded-xl"
                >
                  <h2 className="text-md font-medium break-words">
                    {referrer}
                  </h2>
                  <h2 className="text-md pl-3 font-medium break-words">
                    ({feeNumber / 100}%)
                  </h2>
                </div>
              )
            })}
          </div>
        ) : (
          <h2 className="text-1xl mt-3 w-full text-center">
            You haven&apos;t added any referrers yet
          </h2>
        )}
      </div>
    </form>
  )
}
