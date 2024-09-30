'use client'

import { FaTrash as TrashIcon } from 'react-icons/fa'
import {
  Button,
  Input,
  Detail,
  AddressInput,
  Placeholder,
} from '@unlock-protocol/ui'
import { PaywallConfigType, Event } from '@unlock-protocol/core'
import { SettingCard } from '~/components/interface/locks/Settings/elements/SettingCard'
import { useLockData } from '~/hooks/useLockData'
import { onResolveName } from '~/utils/resolvers'
import { Controller, useForm } from 'react-hook-form'
import { useReferrerFee } from '~/hooks/useReferrerFee'
import { ToastHelper } from '~/components/helpers/toast.helper'
import useEns from '~/hooks/useEns'
import { addressMinify } from '~/utils/strings'
import CopyUrlButton from '../CopyUrlButton'
import { getEventUrl } from '../utils'

interface ReferralsProps {
  event: Event
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

interface FormProps {
  referralFeePercentage: number
  referralAddress: string
}

export const Referral = ({
  eventUrl,
  onDelete,
  referral: { referrer, fee },
}: {
  eventUrl: string
  onDelete: (referrer: string) => void
  referral: { referrer: string; fee: number }
}) => {
  const addressToEns = useEns(referrer)

  const resolvedAddress =
    addressToEns === referrer ? addressMinify(referrer) : addressToEns

  const eventUrlWithReferrer = new URL(eventUrl)
  eventUrlWithReferrer.searchParams.append('referrer', referrer)

  return (
    <div className="flex gap-4 mb-2">
      <Detail valueSize="medium" label="Fee:">
        {fee / 100}%
      </Detail>
      <Detail valueSize="medium" label="Address:">
        {resolvedAddress}
      </Detail>
      <div className="grow flex justify-end place-items-center	flex-row ">
        <CopyUrlButton url={eventUrlWithReferrer.toString()} />
        <div>
          <Button
            size="tiny"
            iconLeft={<TrashIcon />}
            onClick={() => onDelete(referrer)}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

export const ReferralsForLock = ({
  eventUrl,
  lockAddress,
  network,
}: {
  eventUrl: string
  lockAddress: string
  network: number
}) => {
  const { lock, isLockLoading } = useLockData({ lockAddress, network })

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid },
  } = useForm<FormProps>({})

  const {
    data: referralFees,
    isLoading,
    setReferrerFee,
    refetch,
  } = useReferrerFee({
    lockAddress,
    network,
  })

  const onSubmit = async (data: FormProps) => {
    const setReferrerFeePromise = setReferrerFee.mutateAsync({
      ...data,
    })

    await ToastHelper.promise(setReferrerFeePromise, {
      loading: 'Setting a new referral fee!',
      error: 'Failed to set a new referrer, please try again.',
      success: 'Referral fee set!',
    })

    reset()
    refetch()
  }

  const deleteReferrer = async (referralAddress: string) => {
    const setReferrerFeePromise = setReferrerFee.mutateAsync({
      referralAddress,
      referralFeePercentage: 0,
    })

    await ToastHelper.promise(setReferrerFeePromise, {
      loading: 'Deleting referral',
      error: 'Failed to delete the referrer, please try again.',
      success: 'Referral fee deleted!',
    })

    reset()
    refetch()
  }

  if (isLockLoading || !lock) {
    return (
      <SettingCard label="">
        <Placeholder.Root>
          <Placeholder.Line size="sm" />
          <Placeholder.Line size="sm" />
        </Placeholder.Root>
      </SettingCard>
    )
  }
  return (
    <SettingCard label={lock.name} description={''}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col md:flex-row gap-2">
          <span className="grow">
            <Controller
              {...register('referralAddress', {
                required: true,
              })}
              control={control}
              render={({ field }) => {
                return (
                  <AddressInput
                    placeholder="Address or ENS"
                    onResolveName={onResolveName}
                    {...field}
                  />
                )
              }}
            />
          </span>
          <span>
            <Input
              type="number"
              {...register('referralFeePercentage', {
                valueAsNumber: true,
                min: 1,
                max: 100,
                required: true,
              })}
              placeholder="Referrer fee (%)"
              error={
                errors?.referralFeePercentage &&
                'This field accepts percentage values between 1 and 100.'
              }
            />
          </span>
          <span className="flex items-start ">
            <Button
              type="submit"
              className="w-24 md:mt-1"
              disabled={!isValid}
              size="small"
              loading={false}
            >
              Add
            </Button>
          </span>
        </div>

        {isLoading && (
          <Placeholder.Root>
            <Placeholder.Line size="sm" />
            <Placeholder.Line size="sm" />
          </Placeholder.Root>
        )}
        {referralFees?.length > 0 && (
          <h2 className="text-lg font-bold mt-4 mb-2">Referrals:</h2>
        )}
        <div className="flex flex-col gap-2">
          {referralFees?.map((referral) => {
            return (
              <Referral
                eventUrl={eventUrl}
                onDelete={deleteReferrer}
                key={referral.id}
                referral={referral}
              />
            )
          })}
        </div>
      </form>
    </SettingCard>
  )
}

export const Referrals = ({ event, checkoutConfig }: ReferralsProps) => {
  const eventUrl = getEventUrl({
    event,
  })

  const locks = Object.keys(checkoutConfig.config.locks)
  return (
    <>
      {locks.map((lock) => {
        const network =
          checkoutConfig.config.locks[lock].network ||
          checkoutConfig.config.network
        return (
          <ReferralsForLock
            eventUrl={eventUrl}
            lockAddress={lock}
            key={lock}
            network={network!}
          />
        )
      })}
    </>
  )
}
