import React, { useEffect, useState } from 'react'
import { Button, Input, Select, ToggleSwitch } from '@unlock-protocol/ui'
import { Token } from '@unlock-protocol/types'
import { useForm } from 'react-hook-form'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { SelectCurrencyModal } from '../modals/SelectCurrencyModal'
import { BalanceWarning } from './BalanceWarning'
import { useConfig } from '~/utils/withConfig'
import { lockTickerSymbol } from '~/utils/checkoutLockUtils'
import { CryptoIcon } from '../../elements/KeyPrice'
import { useQuery } from 'react-query'
import useAccount from '~/hooks/useAccount'

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

export const CreateLockForm = ({
  onSubmit,
  defaultValues,
}: CreateLockFormProps) => {
  const { networks } = useConfig()
  const { network, account, changeNetwork } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const { getTokenBalance } = useAccount(account!, network!)
  const { baseCurrencySymbol } = networks[network!] ?? {}

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
    setValue,
    formState: { isValid, errors },
  } = useForm<LockFormProps>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      network: network!,
      maxNumberOfKeys: undefined,
      expirationDuration: undefined,
      keyPrice: undefined,
      unlimitedDuration,
      unlimitedQuantity,
      isFree,
    },
  })

  const getBalance = async () => {
    const balance = await getTokenBalance('')
    return parseFloat(balance)
  }

  const { isLoading: isLoadingBalance, data: balance } = useQuery(
    ['getBalance'],
    () => getBalance()
  )

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const onHandleSubmit = (values: LockFormProps) => {
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
    defaultValues?.symbol ||
    selectedToken?.symbol ||
    baseCurrencySymbol
  )?.toLowerCase()

  const symbol = lockTickerSymbol(networks[network!], selectedCurrency)

  const networkOptions = Object.values(networks || {})?.map(
    ({ name, id }: any) => {
      return {
        label: name,
        value: id,
      }
    }
  )

  const onChangeNetwork = (network: number | string) => {
    changeNetwork(networks[parseInt(`${network}`)])
    setSelectedToken(null)
  }

  return (
    <>
      <SelectCurrencyModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        network={network!}
        onSelect={onSelectToken}
        defaultCurrency={baseCurrencySymbol}
      />
      <div className="mb-4">
        {noBalance && <BalanceWarning network={network!} balance={balance!} />}
      </div>
      <div className="overflow-hidden bg-white rounded-xl">
        <div className="px-3 py-8 md:py-4">
          <form
            className="flex flex-col w-full gap-10"
            onSubmit={handleSubmit(onHandleSubmit)}
          >
            <Select
              label="Network:"
              defaultValue={networks[network!].id}
              options={networkOptions}
              onChange={onChangeNetwork}
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

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="block px-1 text-base" htmlFor="">
                  Memberships duration (days):
                </label>
                <ToggleSwitch
                  title="Unlimited"
                  enabled={unlimitedDuration}
                  setEnabled={setUnlimitedDuration}
                  onChange={(enable: boolean) => {
                    setValue('unlimitedDuration', enable)
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

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="block px-1 text-base" htmlFor="">
                  Number of memberships:
                </label>
                <ToggleSwitch
                  title="Unlimited"
                  enabled={unlimitedQuantity}
                  setEnabled={setUnlimitedQuantity}
                  onChange={(enable: boolean) => {
                    setValue('unlimitedQuantity', enable)
                  }}
                />
              </div>
              <div className="relative">
                <Input
                  placeholder="Enter quantity"
                  type="numeric"
                  autoComplete="off"
                  step={1}
                  disabled={unlimitedQuantity}
                  {...register('maxNumberOfKeys', {
                    min: 1,
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

            <div className="relative flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="px-1 mb-2 text-base" htmlFor="">
                  Currency & Price:
                </label>
                <ToggleSwitch
                  title="Free"
                  enabled={isFree}
                  setEnabled={setIsFree}
                  onChange={(enable: boolean) => {
                    setValue('isFree', enable)
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
                    type="numeric"
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
