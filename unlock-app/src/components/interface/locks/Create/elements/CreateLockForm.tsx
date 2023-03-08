import React, { useCallback, useEffect, useState } from 'react'
import { Button, Input, Select, ToggleSwitch } from '@unlock-protocol/ui'
import { Token, NetworkConfig } from '@unlock-protocol/types'
import { useForm, useWatch } from 'react-hook-form'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { SelectCurrencyModal } from '../modals/SelectCurrencyModal'
import { BalanceWarning } from './BalanceWarning'
import { useConfig } from '~/utils/withConfig'
import { lockTickerSymbol } from '~/utils/checkoutLockUtils'
import { useQuery } from '@tanstack/react-query'
import { getAccountTokenBalance } from '~/hooks/useAccount'
import { useWeb3Service } from '~/utils/withWeb3Service'
import Link from 'next/link'
import { networks } from '@unlock-protocol/networks'
import { CryptoIcon } from '@unlock-protocol/crypto-icon'

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
}

export const networkDescription = (network: number) => {
  if (network === 5) {
    return (
      <>
        Need some Test ETH?{' '}
        <a
          className="underline"
          target="_blank"
          href="https://goerlifaucet.com/"
          rel="noreferrer"
        >
          Check this faucet.
        </a>
      </>
    )
  } else if (network === 1) {
    return (
      <>
        Gas fees on the <em>Ethereum mainnet are expensive</em>. Please consider
        using another network like Polygon, Gnosis Chain or Optimism.
      </>
    )
  } else {
    return <>{networks[network!].description}</>
  }
}

export const CreateLockForm = ({
  onSubmit,
  defaultValues,
}: CreateLockFormProps) => {
  const { networks } = useConfig()
  const web3Service = useWeb3Service()
  const { account, network } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
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
    reset,
    control,
    setValue,
    formState: { isValid, errors },
  } = useForm<LockFormProps>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      network,
      maxNumberOfKeys: undefined,
      expirationDuration: undefined,
      keyPrice: undefined,
      unlimitedDuration,
      unlimitedQuantity,
      isFree,
    },
  })
  const { network: selectedNetwork } = useWatch({
    control,
  })

  const { baseCurrencySymbol } = networks[selectedNetwork!] ?? {}

  const getBalance = async () => {
    const balance = await getAccountTokenBalance(
      web3Service,
      account!,
      null,
      selectedNetwork || 1
    )
    return parseFloat(balance)
  }

  const { isLoading: isLoadingBalance, data: balance } = useQuery(
    ['getBalance', selectedNetwork, account],
    () => getBalance()
  )

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const onHandleSubmit = (values: LockFormProps) => {
    console.log({ values }, { selectedNetwork, network })
    if (isValid) {
      if (typeof onSubmit === 'function') {
        onSubmit(values)
      }
    } else {
      ToastHelper.error('Form is not valid')
    }
  }

  const onSelectToken = (token: Token) => {
    setSelectedToken(token)
    setValue('currencyContractAddress', token.address)
    setValue('symbol', token.symbol)
  }

  const noBalance = balance === 0 && !isLoadingBalance
  const submitDisabled = isLoadingBalance || noBalance
  const selectedCurrency = (
    selectedToken?.symbol ||
    defaultValues?.symbol ||
    baseCurrencySymbol
  )?.toLowerCase()

  const symbol = lockTickerSymbol(networks[selectedNetwork!], selectedCurrency)

  const networkOptions = Object.values<NetworkConfig>(networks || {})
    ?.filter(({ featured }: NetworkConfig) => !!featured)
    .map(({ name, id }: NetworkConfig) => {
      return {
        label: name,
        value: id,
      }
    })
  if (networks[network!] && !networks[network!].featured) {
    networkOptions.push({
      label: networks[network!].name,
      value: networks[network!].id,
    })
  }

  const onChangeNetwork = useCallback(
    (network: number | string) => {
      setSelectedToken(null)
      setValue('network', parseInt(`${network}`))
    },
    [setValue, setSelectedToken]
  )

  useEffect(() => {
    if (network) {
      onChangeNetwork(network)
    }
  }, [onChangeNetwork, network])

  return (
    <>
      <SelectCurrencyModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        network={selectedNetwork!}
        onSelect={onSelectToken}
      />
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
            <Select
              label="Network:"
              tooltip={
                <>
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
                  and you will be able to deploy your contract on it.
                </>
              }
              defaultValue={selectedNetwork}
              options={networkOptions}
              onChange={onChangeNetwork}
              description={networkDescription(selectedNetwork!)}
            />
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
                  Memberships duration (days):
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
                  step={0.01}
                  disabled={unlimitedDuration}
                  {...register('expirationDuration', {
                    min: 0,
                    required: !unlimitedDuration,
                  })}
                  placeholder="Enter duration"
                  type="number"
                />
                {errors?.expirationDuration && (
                  <span className="absolute mt-1 text-xs text-red-700">
                    Please enter amount of days.
                  </span>
                )}
              </div>
            </div>
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

            <div className="relative flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="px-1 mb-2 text-base" htmlFor="">
                  Currency & Price:
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
                <div className="grid grid-cols-2 gap-2 justify-items-stretch">
                  <div className="flex flex-col gap-1.5">
                    <div
                      onClick={() => setIsOpen(true)}
                      className="box-border flex items-center flex-1 w-full gap-2 pl-4 text-base text-left transition-all border border-gray-400 rounded-lg shadow-sm cursor-pointer hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none"
                    >
                      <CryptoIcon symbol={symbol} />
                      <span>{symbol}</span>
                    </div>
                    <div className="pl-1"></div>
                  </div>

                  <Input
                    type="number"
                    autoComplete="off"
                    placeholder="0.00"
                    step={0.01}
                    disabled={isFree}
                    {...register('keyPrice', {
                      required: !isFree,
                    })}
                  />
                </div>
                {errors?.keyPrice && (
                  <span className="absolute text-xs text-red-700 ">
                    Please enter a positive number
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
