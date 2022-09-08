import React from 'react'
import { Button, Icon, Input } from '@unlock-protocol/ui'
import { Controller } from 'react-hook-form'
import { RadioGroup } from '@headlessui/react'
import {
  MdRadioButtonUnchecked as UncheckedIcon,
  MdRadioButtonChecked as CheckedIcon,
} from 'react-icons/md'
import { useAuth } from '~/contexts/AuthenticationContext'
import { NetworkSelection } from './NetworkSelection'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { LockFormProps, useCreateLock } from '../useCreateLock'

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

export const CreateLockForm = ({ onSubmit }: any) => {
  const { network } = useAuth()

  console.log('onSubmit', onSubmit)
  const {
    form: {
      register,
      handleSubmit,
      control,
      setValue,
      formState: { isValid, errors },
    },
    values,
  } = useCreateLock(network!)

  const onHandleSubmit = (values: LockFormProps) => {
    if (isValid) {
      console.log(values)
      if (typeof onSubmit === 'function') {
        onSubmit(values)
      }
    } else {
      ToastHelper.error('Form is not valid')
    }
  }

  return (
    <div className="px-3 py-4 bg-white rounded-xl">
      <form
        className="flex flex-col w-full gap-10"
        onSubmit={handleSubmit(onHandleSubmit)}
      >
        <NetworkSelection />
        <div className="relative">
          <Input
            label="Name"
            placeholder="Example Lock"
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
                      setValue('duration', undefined)
                    }
                  }}
                >
                  <RadioGroup.Option value="true">
                    {({ checked }) => (
                      <div className="flex items-center gap-4">
                        <Radio checked={checked} />
                        <span className="text-lg font-bold">Good forever</span>
                      </div>
                    )}
                  </RadioGroup.Option>
                  <RadioGroup.Option value="false">
                    {({ checked }) => (
                      <div className="flex items-center w-full gap-4">
                        <Radio checked={checked} />
                        <div className="relative flex items-center w-full gap-4">
                          <label className="text-lg font-bold " htmlFor="">
                            Key duration
                          </label>
                          <div className="relative flex grow">
                            <Input
                              tabIndex={-1}
                              {...register('duration', {
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
                      setValue('quantity', undefined)
                    }
                  }}
                  className="flex flex-col w-full gap-5"
                >
                  <RadioGroup.Option value="true">
                    {({ checked }) => (
                      <div className="flex items-center gap-4">
                        <Radio checked={checked} />
                        <span className="text-lg font-bold">Unlimited</span>
                      </div>
                    )}
                  </RadioGroup.Option>
                  <RadioGroup.Option value="false">
                    {({ checked }) => (
                      <div className="flex items-center w-full gap-4">
                        <Radio checked={checked} />
                        <div className="relative grow">
                          <Input
                            placeholder="Enter duration"
                            type="number"
                            step={1}
                            {...register('quantity', {
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
          <div className="grid grid-cols-2 gap-2">
            <div className="h-10 pl-4 border border-gray-400 rounded-lg cursor-pointer focus:outline-none"></div>
            <div className="relative">
              <Input
                type="number"
                {...register('price', {
                  min: 0,
                  required: true,
                })}
              />
              {errors?.price && (
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
  )
}
