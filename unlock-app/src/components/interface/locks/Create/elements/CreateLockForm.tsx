import React, { useCallback, useState } from 'react'
import { Button, Input, Select, ToggleSwitch } from '@unlock-protocol/ui'
import { Token } from '@unlock-protocol/types'
import { useForm, useWatch } from 'react-hook-form'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { BalanceWarning } from './BalanceWarning'
import { useConfig } from '~/utils/withConfig'
import { useQuery } from '@tanstack/react-query'
import { getAccountTokenBalance } from '~/hooks/useAccount'
import { useWeb3Service } from '~/utils/withWeb3Service'
import Link from 'next/link'
import { networks } from '@unlock-protocol/networks'
import { useAvailableNetworks } from '~/utils/networks'
import { SelectToken } from './SelectToken'

export interface LockFormProps {
  name: string
  keyPrice?: number
  expirationDuration?: number
  maxNumberOfKeys?: number
  network: number
  unlimitedDuration: boolean
  unlimitedQuantity: boolean
  isFree: boolean
  currencyContractAddress?: string
  symbol?: string
}

interface CreateLockFormProps {
  onSubmit: any
  defaultValues: LockFormProps
  hideFields?: string[]
}

export const networkDescription = (network: number) => {
  const { description, url, faucet, nativeCurrency } = networks[network!]
  return (
    <>
      {description}{' '}
      {url && (
        <>
          <Link className="underline" href={url} target="_blank">
            Learn more
          </Link>
          .
        </>
      )}
      {faucet && (
        <>
          {' '}
          <br />
          Need some {nativeCurrency.name} to pay for gas?{' '}
          <Link className="underline" href={faucet} target="_blank">
            Try this faucet
          </Link>
          .
        </>
      )}
    </>
  )
}

export const CreateLockForm = ({
  onSubmit,
  defaultValues,
  hideFields = [],
}: CreateLockFormProps) => {
  const { networks } = useConfig()
  const web3Service = useWeb3Service()
  const { account } = useAuth()
  const networkOptions = useAvailableNetworks()

  const [unlimitedDuration, setUnlimitedDuration] = useState(
    defaultValues?.unlimitedDuration ?? false
  )
  const [unlimitedQuantity, setUnlimitedQuantity] = useState(
    defaultValues?.unlimitedQuantity
  )
  const [isFree, setIsFree] = useState(defaultValues?.isFree ?? false)
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { isValid, errors },
  } = useForm<LockFormProps>({
    mode: 'onChange',
    defaultValues: {
      name: defaultValues.name || '',
      network: defaultValues.network || networkOptions[0]?.value,
      maxNumberOfKeys: undefined,
      expirationDuration: undefined,
      keyPrice: undefined,
      currencyContractAddress: defaultValues.currencyContractAddress,
      unlimitedDuration,
      unlimitedQuantity,
      isFree,
    },
  })

  const { network: selectedNetwork, currencyContractAddress } = useWatch({
    control,
  })

  const { isLoading: isLoadingBalance, data: balance } = useQuery(
    ['getBalance', selectedNetwork, account],
    async () => {
      const balance = await getAccountTokenBalance(
        web3Service,
        account!,
        null,
        selectedNetwork || 10
      )
      return parseFloat(balance)
    }
  )

  const onHandleSubmit = (values: LockFormProps) => {
    if (isValid) {
      if (typeof onSubmit === 'function') {
        onSubmit(values)
      }
    } else {
      ToastHelper.error('Form is not valid')
    }
  }

  const noBalance = balance === 0 && !isLoadingBalance
  const submitDisabled = isLoadingBalance || noBalance

  const onChangeNetwork = useCallback(
    (network: number | string) => {
      setValue('currencyContractAddress', undefined)
      setValue('network', parseInt(`${network}`))
    },
    [setValue]
  )

  return (
    <>
      <div className="mb-4">
        {noBalance && (
          <BalanceWarning network={selectedNetwork!} balance={balance!} />
        )}
      </div>
      <div className="overflow-hidden bg-white rounded-xl">
        <div className="px-3 py-8 md:py-4">
          <form
            className="flex flex-col w-full gap-6"
            onSubmit={handleSubmit(onHandleSubmit)}
          >
            {!hideFields.includes('network') && (
              <Select
                label="Network:"
                tooltip={
                  <p className="py-2">
                    Unlock supports{' '}
                    <Link
                      target="_blank"
                      className="underline"
                      href="https://docs.unlock-protocol.com/core-protocol/unlock/networks"
                    >
                      {Object.keys(networks).length} networks
                    </Link>
                    .
                    <br />
                    If yours is not in the list below, switch your wallet to it{' '}
                    <br />
                    and it will be added to the list.
                  </p>
                }
                defaultValue={selectedNetwork}
                options={networkOptions}
                onChange={onChangeNetwork}
                description={networkDescription(selectedNetwork!)}
              />
            )}
            <div className="relative">
              <Input
                label="Name:"
                autoComplete="off"
                placeholder="Lock Name"
                {...register('name', {
                  required: true,
                  minLength: 3,
                })}
              />
              {errors?.name && (
                <span className="absolute text-xs text-red-700">
                  A name is required.
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="block px-1 text-base" htmlFor="">
                  Membership duration:
                </label>
                <ToggleSwitch
                  title="Unlimited"
                  enabled={unlimitedDuration}
                  setEnabled={setUnlimitedDuration}
                  onChange={(enable: boolean) => {
                    if (enable) {
                      setValue('expirationDuration', undefined)
                    }
                    setValue('unlimitedDuration', enable, {
                      shouldValidate: true,
                    })
                  }}
                />
              </div>
              <div className="relative">
                <Input
                  tabIndex={-1}
                  autoComplete="off"
                  step="any"
                  disabled={unlimitedDuration}
                  {...register('expirationDuration', {
                    min: 0,
                    required: !unlimitedDuration,
                  })}
                  placeholder="In days"
                  type="number"
                />
                {errors?.expirationDuration && (
                  <span className="absolute mt-1 text-xs text-red-700">
                    Please enter amount of days.
                  </span>
                )}
              </div>
            </div>
            {!hideFields.includes('quantity') && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="block px-1 text-base" htmlFor="">
                    Number of memberships for sale:
                  </label>
                  <ToggleSwitch
                    title="Unlimited"
                    enabled={unlimitedQuantity}
                    setEnabled={setUnlimitedQuantity}
                    onChange={(enable: boolean) => {
                      if (enable) {
                        setValue('maxNumberOfKeys', undefined)
                      }
                      setValue('unlimitedQuantity', enable, {
                        shouldValidate: true,
                      })
                    }}
                  />
                </div>
                <div className="relative">
                  <Input
                    placeholder="Enter quantity"
                    type="number"
                    autoComplete="off"
                    step={1}
                    disabled={unlimitedQuantity}
                    {...register('maxNumberOfKeys', {
                      valueAsNumber: true,
                      min: 0,
                      required: !unlimitedQuantity,
                    })}
                  />
                  {errors?.maxNumberOfKeys && (
                    <span className="absolute mt-1 text-xs text-red-700">
                      Please choose a number of memberships for your lock.
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="relative flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="px-1 mb-2 text-base" htmlFor="">
                  Membership price:
                </label>
                <ToggleSwitch
                  title="Free"
                  enabled={isFree}
                  setEnabled={setIsFree}
                  onChange={(enable: boolean) => {
                    setValue('keyPrice', enable ? 0 : undefined)
                    setValue('isFree', enable, {
                      shouldValidate: true,
                    })
                  }}
                />
              </div>
              <div className="relative">
                <div className="flex gap-2 ">
                  {/* {!hideFields.includes('currency') && ( */}
                  <SelectToken
                    className="grow"
                    onChange={(token: Token) => {
                      setValue('currencyContractAddress', token.address)
                      setValue('symbol', token.symbol)
                    }}
                    defaultToken={{
                      address: currencyContractAddress,
                    }}
                    network={selectedNetwork!}
                  />
                  {/* )} */}

                  <Input
                    type="number"
                    autoComplete="off"
                    placeholder="0.00"
                    step="any"
                    disabled={isFree}
                    {...register('keyPrice', {
                      valueAsNumber: true,
                      required: !isFree,
                    })}
                  />
                </div>
                {errors?.keyPrice && (
                  <span className="absolute text-xs text-red-700 ">
                    Please enter a positive number for the price
                  </span>
                )}
              </div>
            </div>
            <Button
              className="mt-8 md:mt-0"
              type="submit"
              disabled={submitDisabled}
            >
              Next
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
