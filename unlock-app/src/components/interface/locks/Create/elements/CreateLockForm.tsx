import { useCallback, useState } from 'react'
import {
  Button,
  Combobox,
  Input,
  Select,
  ToggleSwitch,
} from '@unlock-protocol/ui'
import { Token } from '@unlock-protocol/types'
import { useForm, useWatch } from 'react-hook-form'
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
import { ProtocolFee } from './ProtocolFee'
import { useAuthenticate } from '~/hooks/useAuthenticate'

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
  defaultValues?: Partial<LockFormProps>
  hideFields?: string[]
  isLoading?: boolean
  defaultOptions?: any
}

export const NetworkDescription = ({ network }: { network: number }) => {
  const { description, url, faucets, nativeCurrency } = networks[network!]
  return (
    <div>
      {description}{' '}
      {url && (
        <>
          (
          <Link className="underline" href={url} target="_blank">
            Learn more
          </Link>
          ).{' '}
        </>
      )}
      {network === 1 && (
        <p className="text-red-600 font-bold">
          Due to high gas costs, we strongly discourage the use of the Ethereum
          Mainnet.
        </p>
      )}
      {faucets && (
        <div className="mt-1">
          Need some {nativeCurrency.name} to pay for gas?
          {faucets.length > 1
            ? ' Try one of these faucets: '
            : ' Try this faucet: '}
          {faucets.map((faucet: any, index) => {
            return (
              <>
                <Link className="underline" href={faucet.url} target="_blank">
                  {faucet.name}
                </Link>
                {index < faucets.length - 1 ? ', ' : ''}
              </>
            )
          })}
        </div>
      )}
    </div>
  )
}

export const CreateLockForm = ({
  onSubmit,
  defaultValues = {},
  hideFields = [],
  isLoading = false,
  defaultOptions = {},
}: CreateLockFormProps) => {
  const { networks } = useConfig()
  const web3Service = useWeb3Service()
  const { account } = useAuthenticate()
  const mainNetworkOptions = useAvailableNetworks()
  const additionalNetworkOptions = useAvailableNetworks(true)

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
      network: defaultValues.network || mainNetworkOptions[0]?.value,
      maxNumberOfKeys: undefined,
      expirationDuration: undefined,
      keyPrice: defaultValues.keyPrice,
      currencyContractAddress: defaultValues.currencyContractAddress,
      unlimitedDuration,
      unlimitedQuantity,
      isFree,
    },
  })

  const { network: selectedNetwork, currencyContractAddress } = useWatch({
    control,
  })

  const { isPending: isLoadingBalance, data: balance } = useQuery({
    queryKey: ['getBalance', selectedNetwork, account],
    queryFn: async () => {
      const balance = await getAccountTokenBalance(
        web3Service,
        account!,
        null,
        selectedNetwork || 10
      )
      return parseFloat(balance)
    },
  })

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
              <Combobox
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
                options={mainNetworkOptions}
                onChange={onChangeNetwork}
                description={<NetworkDescription network={selectedNetwork!} />}
                moreOptions={additionalNetworkOptions}
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
                  {defaultOptions.expirationDuration?.label
                    ? defaultOptions.expirationDuration.label
                    : 'Membership duration'}
                  :
                </label>
                {!defaultOptions.notUnlimited && (
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
                )}
              </div>
              <div className="relative">
                {defaultOptions.expirationDuration && (
                  <Select
                    {...register('expirationDuration')}
                    defaultValue={defaultValues.expirationDuration}
                    options={defaultOptions.expirationDuration.values}
                    onChange={(value: number) => {
                      setValue('expirationDuration', value)
                    }}
                  />
                )}
                {!defaultOptions.expirationDuration && (
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
                )}
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
                    enabled={!!unlimitedQuantity}
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
                {!defaultOptions.notFree && (
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
                )}
              </div>
              <div className="relative">
                <div className="flex gap-2 ">
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
                    noNative={defaultOptions.noNative}
                  />

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
                  <span className="text-xs text-red-700 ">
                    Please enter a positive number for the price
                  </span>
                )}
              </div>
              <ProtocolFee network={selectedNetwork!} />
            </div>
            <Button
              className="mt-8 md:mt-0"
              type="submit"
              disabled={submitDisabled}
              loading={isLoading}
            >
              Next
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
