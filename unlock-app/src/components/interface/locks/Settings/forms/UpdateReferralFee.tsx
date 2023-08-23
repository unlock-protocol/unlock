import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Button,
  Input,
  ToggleSwitch,
  Card,
  AddressInput,
} from '@unlock-protocol/ui'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import { ethers } from 'ethers'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import LoadingIcon from '~/components/interface/Loading'
import { useAuth } from '~/contexts/AuthenticationContext'
import { onResolveName } from '~/utils/resolvers'

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

export const UpdateReferralFee = ({
  lockAddress,
  network,
  isManager,
  disabled,
}: UpdateReferralFeeProps) => {
  const [isReferralFeeEnabled, setIsReferralFeeEnabled] = useState(false)
  const [isReferralAddressEnabled, setIsReferralAddressEnabled] =
    useState(false)
  const { getWalletService } = useAuth()

  const {
    watch,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormProps>({
    defaultValues: { referralFeePercentage: 0, referralAddress: '' },
  })

  const referralAddress = watch('referralAddress', '')

  const setReferrerFee = async (fields: FormProps) => {
    const walletService = await getWalletService(network)
    await walletService.setReferrerFee({
      lockAddress,
      address: fields?.referralAddress,
      feeBasisPoint: fields?.referralFeePercentage * 100,
    })
  }

  const getLock = async () => {
    const service = new SubgraphService()
    return service.lock(
      {
        where: {
          id: lockAddress,
        },
      },
      {
        network,
      }
    )
  }

  const setReferrerFeeMutation = useMutation(setReferrerFee)

  const isValidAddress = ethers.utils.isAddress(referralAddress)

  const onSubmit = async (fields: FormProps) => {
    const setReferrerFeePromise = setReferrerFeeMutation.mutateAsync({
      ...fields,
      referralAddress: ethers.utils.getAddress(referralAddress),
    })

    await ToastHelper.promise(setReferrerFeePromise, {
      loading: 'Setting new referrer',
      error: 'Failed to update the values, please try again.',
      success: 'New referrer set',
    })

    reset()
  }

  const { isLoading, data: referralFeesData } = useQuery(
    ['getLock', lockAddress, network, setReferrerFeeMutation.isSuccess],
    async () => getLock()
  )

  const referralFees = referralFeesData?.referrerFees || []

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
            min: 1,
            max: 100,
          })}
          error={
            errors?.referralFeePercentage &&
            'This field accept percentage value between 1 and 100.'
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

        <AddressInput
          label=""
          value={referralAddress}
          disabled={isDisabledReferrerInput || !isReferralAddressEnabled}
          onChange={(value: any) => {
            setValue('referralAddress', value)
          }}
          error={errors?.referralAddress?.message}
          onResolveName={onResolveName}
        />
      </div>

      {isManager && (
        <Button
          className="w-full md:w-1/3"
          type="submit"
          disabled={isDisabledReferrerInput || !isValidAddress}
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
