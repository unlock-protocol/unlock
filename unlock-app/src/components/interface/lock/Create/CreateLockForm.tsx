import React from 'react'
import { Button, Icon, Input } from '@unlock-protocol/ui'
import { Controller, useForm } from 'react-hook-form'
import { RadioGroup } from '@headlessui/react'
import {
  MdRadioButtonUnchecked as UncheckedIcon,
  MdRadioButtonChecked as CheckedIcon,
} from 'react-icons/md'
import { useAuth } from '~/contexts/AuthenticationContext'
import { NetworkSelection } from './NetworkSelection'

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

export const CreateLockForm = () => {
  const { network } = useAuth()

  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      name: '',
      duration: null,
      price: null,
      network,
    },
  })

  const onSubmit = () => {}
  return (
    <div className="px-3 py-4 bg-white rounded-xl">
      <form
        className="flex flex-col w-full gap-10"
        onSubmit={handleSubmit(onSubmit)}
      >
        <NetworkSelection />
        <Input label="Name" placeholder="Example Lock" {...register('name')} />

        <div>
          <label className="block px-1 mb-4 text-base" htmlFor="">
            Duration
          </label>
          <Controller
            control={control}
            name="duration"
            render={({ field: { value, onChange } }) => {
              console.log(value)
              return (
                <RadioGroup
                  className="flex flex-col w-full gap-5"
                  value={value}
                  onChange={onChange}
                >
                  <RadioGroup.Option value="1">
                    {({ checked }) => (
                      <div className="flex items-center gap-4">
                        <Radio checked={checked} />
                        <span className="text-lg font-bold">Good forever</span>
                      </div>
                    )}
                  </RadioGroup.Option>
                  <RadioGroup.Option value="2">
                    {({ checked }) => (
                      <div className="flex items-center w-full gap-4">
                        <Radio checked={checked} />
                        <div className="flex items-center gap-4">
                          <label className="text-lg font-bold " htmlFor="">
                            Expired at
                          </label>
                          <Input placeholder="Enter quantity" type="date" />
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
          <RadioGroup className="flex flex-col gap-5">
            <RadioGroup.Option value="forever">
              {({ checked }) => (
                <div className="flex items-center gap-4">
                  <Radio checked={checked} />
                  <span className="text-lg font-bold">Unlimited</span>
                </div>
              )}
            </RadioGroup.Option>
            <RadioGroup.Option value="duration">
              {({ checked }) => (
                <div className="flex items-center w-full gap-4">
                  <Radio checked={checked} />
                  <Input
                    placeholder="Enter quantity"
                    className="w-full"
                    type="number"
                  />
                </div>
              )}
            </RadioGroup.Option>
          </RadioGroup>
        </div>

        <div>
          <label className="block px-1 mb-2 text-base" htmlFor="">
            Currency & Price
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="box-border flex-1 block w-full py-2 pl-4 text-base text-left transition-all border border-gray-400 rounded-lg shadow-sm hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none">
              CURRENCY
            </div>
            <Input
              type="number"
              {...register('price', {
                min: 0,
              })}
            />
          </div>
        </div>

        <Button type="submit" disabled>
          Next
        </Button>
      </form>
    </div>
  )
}
