import React, { useEffect, useState } from 'react'
import { Button, Icon, Input } from '@unlock-protocol/ui'
import { Token } from '@unlock-protocol/types'
import { Controller, useForm } from 'react-hook-form'
import { RadioGroup } from '@headlessui/react'
import {
  MdRadioButtonUnchecked as UncheckedIcon,
  MdRadioButtonChecked as CheckedIcon,
} from 'react-icons/md'
import { useAuth } from '~/contexts/AuthenticationContext'
import { NetworkSelection } from './NetworkSelection'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { SelectCurrencyModal } from '../modals/SelectCurrencyModal'
import { BalanceWarning } from './BalanceWarning'
import { useConfig } from '~/utils/withConfig'
import { lockTickerSymbol } from '~/utils/checkoutLockUtils'
import { CryptoIcon } from './KeyPrice'
import { useQuery } from 'react-query'
import useAccount from '~/hooks/useAccount'

const Radio = ({ checked }: { checked: boolean }) => {
  return checked ? (
    <Icon
      size="large"
      className="cursor-pointer fill-brand-ui-primary"
      icon={CheckedIcon}
    />
  ) : (
    <Icon
      size="large"
      className="cursor-pointer fill-brand-ui-primary"
      icon={UncheckedIcon}
    />
  )
}

export interface LockFormProps {
  name: string
  keyPrice?: number
  expirationDuration?: number
  maxNumberOfKeys?: number
  network: number
  unlimitedDuration: boolean
  unlimitedQuantity: boolean
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
  const { network, account } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const { getTokenBalance } = useAccount(account!, network!)
  const { baseCurrencySymbol } = networks[network!] ?? {}

  const {
    register,
    handleSubmit,
    control,
    reset,
    resetField,
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
      unlimitedDuration: true,
      unlimitedQuantity: true,
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
        <div className="px-3 py-4">
          <form
            className="flex flex-col w-full gap-10"
            onSubmit={handleSubmit(onHandleSubmit)}
          >
            <NetworkSelection onChange={() => setSelectedToken(null)} />
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

            <div>
              <label className="block px-1 mb-4 text-base" htmlFor="">
                Memberships duration (days):
              </label>
              <Controller
                control={control}
                name="unlimitedDuration"
                render={({ field: { value, onChange } }) => {
                  return (
                    <RadioGroup
                      className="flex flex-col w-full gap-5"
                      value={value.toString()}
                      onChange={(current: any) => {
                        onChange(current === 'true')
                        if (current === 'true') {
                          resetField('expirationDuration')
                        }
                      }}
                    >
                      <RadioGroup.Option
                        className="inline-flex focus:outline-none"
                        value="true"
                      >
                        {({ checked }) => (
                          <div className="flex items-center gap-4">
                            <Radio checked={checked} />
                            <span className="text-lg font-bold cursor-pointer">
                              Unlimited
                            </span>
                          </div>
                        )}
                      </RadioGroup.Option>
                      <RadioGroup.Option
                        className="focus:outline-none"
                        value="false"
                      >
                        {({ checked }) => (
                          <div className="flex items-center w-full gap-4">
                            <Radio checked={checked} />
                            <div className="relative flex items-center w-full gap-4">
                              <div className="relative grow">
                                <Input
                                  tabIndex={-1}
                                  autoComplete="off"
                                  {...register('expirationDuration', {
                                    required: value !== true,
                                    min: 1,
                                  })}
                                  placeholder="Enter duration"
                                  type="number"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </RadioGroup.Option>
                    </RadioGroup>
                  )
                }}
              />
              {errors?.expirationDuration && (
                <span className="absolute mt-2 text-xs text-red-700">
                  Please enter amount of days.
                </span>
              )}
            </div>

            <div>
              <label className="block px-1 mb-4 text-base" htmlFor="">
                Number of memberships:
              </label>
              <Controller
                control={control}
                name="unlimitedQuantity"
                render={({ field: { value, onChange } }) => {
                  return (
                    <RadioGroup
                      value={value.toString()}
                      onChange={(current: any) => {
                        onChange(current === 'true')
                        if (current === 'true') {
                          resetField('maxNumberOfKeys')
                        }
                      }}
                      className="flex flex-col w-full gap-5"
                    >
                      <RadioGroup.Option
                        className="focus:outline-none"
                        value="true"
                      >
                        {({ checked }) => (
                          <div className="flex items-center gap-4 ">
                            <Radio checked={checked} />
                            <span className="text-lg font-bold cursor-pointer">
                              Unlimited
                            </span>
                          </div>
                        )}
                      </RadioGroup.Option>
                      <RadioGroup.Option
                        className="focus:outline-none"
                        value="false"
                      >
                        {({ checked }) => (
                          <div className="flex items-center w-full gap-4">
                            <Radio checked={checked} />
                            <div className="relative grow">
                              <Input
                                placeholder="Enter quantity"
                                type="number"
                                autoComplete="off"
                                step={1}
                                {...register('maxNumberOfKeys', {
                                  min: 1,
                                  required: value !== true,
                                })}
                              />
                            </div>
                          </div>
                        )}
                      </RadioGroup.Option>
                    </RadioGroup>
                  )
                }}
              />
              {errors?.maxNumberOfKeys && (
                <span className="absolute mt-2 text-xs text-red-700">
                  Please choose a number of memberships for your lock.
                </span>
              )}
            </div>

            <div>
              <label className="block px-1 mb-2 text-base" htmlFor="">
                Currency & Price:
              </label>
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

                <div className="relative">
                  <Input
                    type="numeric"
                    autoComplete="off"
                    placeholder="0.00"
                    step={0.05}
                    {...register('keyPrice', {
                      required: true,
                      min: 0,
                    })}
                  />
                </div>
              </div>
              {errors?.keyPrice && (
                <span className="absolute mt-2 text-xs text-red-700">
                  Please enter a positive number
                </span>
              )}
            </div>

            <Button type="submit" disabled={submitDisabled}>
              Next
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
