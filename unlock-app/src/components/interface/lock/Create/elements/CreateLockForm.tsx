import React, { useEffect, useState } from 'react'
import { Button, Icon, Input } from '@unlock-protocol/ui'
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
}

interface CreateLockFormProps {
  onSubmit: any
  defaultValues: LockFormProps
}

export const CreateLockForm: React.FC<CreateLockFormProps> = ({
  onSubmit,
  defaultValues,
}) => {
  const { networks } = useConfig()
  const { network } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const { baseCurrencySymbol } = networks[network!] ?? {}

  const currency = lockTickerSymbol(networks[network!], baseCurrencySymbol)
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
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

  return (
    <>
      <SelectCurrencyModal isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="mb-4">
        <BalanceWarning />
      </div>
      <div className="overflow-hidden bg-white rounded-xl">
        <div className="px-3 py-4">
          <form
            className="flex flex-col w-full gap-10"
            onSubmit={handleSubmit(onHandleSubmit)}
          >
            <NetworkSelection />
            <div className="relative">
              <Input
                label="Name"
                autoComplete="off"
                placeholder="Lock Name"
                {...register('name', {
                  required: true,
                  minLength: 3,
                })}
              />
              {errors?.name && (
                <span className="absolute text-xs text-red-500">
                  This field is required
                </span>
              )}
            </div>

            <div>
              <label className="block px-1 mb-4 text-base" htmlFor="">
                Duration
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
                          setValue('expirationDuration', undefined)
                        }
                      }}
                    >
                      <RadioGroup.Option
                        className="focus:outline-none"
                        value="true"
                      >
                        {({ checked }) => (
                          <div className="flex items-center gap-4 ">
                            <Radio checked={checked} />
                            <span className="text-lg font-bold">
                              Good forever
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
                              <label className="text-lg font-bold " htmlFor="">
                                Key duration
                              </label>
                              <div className="relative grow">
                                <Input
                                  tabIndex={-1}
                                  autoComplete="off"
                                  {...register('expirationDuration', {
                                    required: value !== true,
                                    min: 1,
                                  })}
                                  placeholder="Enter quantity"
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
            </div>

            <div>
              <label className="block px-1 mb-4 text-base" htmlFor="">
                Quantity
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
                          setValue('maxNumberOfKeys', undefined)
                        }
                      }}
                      className="flex flex-col w-full gap-5"
                    >
                      <RadioGroup.Option
                        className="focus:outline-none"
                        value="true"
                      >
                        {({ checked }) => (
                          <div className="flex items-center gap-4">
                            <Radio checked={checked} />
                            <span className="text-lg font-bold">Unlimited</span>
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
                                placeholder="Enter duration"
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
            </div>

            <div>
              <label className="block px-1 mb-2 text-base" htmlFor="">
                Currency & Price
              </label>
              <div className="grid grid-cols-2 gap-2 justify-items-stretch">
                <div className="flex flex-col gap-1.5">
                  <div
                    onClick={() => setIsOpen(true)}
                    className="box-border flex-1 block w-full py-2 pl-4 text-base text-left transition-all border border-gray-400 rounded-lg shadow-sm cursor-pointer hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none"
                  >
                    {currency}
                  </div>
                  <div className="pl-1"></div>
                </div>

                <div className="relative">
                  <Input
                    type="number"
                    autoComplete="off"
                    placeholder="0.00"
                    step={0.05}
                    {...register('keyPrice', {
                      required: true,
                      min: 0,
                    })}
                  />
                  {errors?.keyPrice && (
                    <span className="absolute text-xs text-red-500">
                      This field is required
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button type="submit" disabled={!isValid}>
              Next
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
