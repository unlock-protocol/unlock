import { RadioGroup } from '@headlessui/react'
import { Modal, Input, Button, Icon } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  MdRadioButtonUnchecked as UncheckedIcon,
  MdRadioButtonChecked as CheckedIcon,
} from 'react-icons/md'
import { AiOutlineEdit as EditIcon } from 'react-icons/ai'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWalletService } from '~/utils/withWalletService'
import { UNLIMITED_KEYS_COUNT } from '~/constants'
import { useMutation } from 'react-query'

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

interface EditFormProps {
  maxNumberOfKeys?: number
  unlimitedQuantity: boolean
}

interface EditQuantityProps {
  lockAddress: string
}

export const UpdateQuantityModal = ({ lockAddress }: EditQuantityProps) => {
  const walletService = useWalletService()
  const [isOpen, setIsOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    resetField,
    getValues,
    reset,
    formState: { isValid, errors },
  } = useForm<EditFormProps>({
    mode: 'onChange',
    defaultValues: {
      maxNumberOfKeys: undefined,
      unlimitedQuantity: true,
    },
  })

  useEffect(() => {
    if (!isOpen) return
    reset()
  }, [isOpen, reset])

  const updateMaxNumberOfKeys = async (): Promise<any> => {
    const { unlimitedQuantity, maxNumberOfKeys } = getValues()

    const numbersOfKeys = unlimitedQuantity
      ? UNLIMITED_KEYS_COUNT
      : maxNumberOfKeys

    return await walletService.setMaxNumberOfKeys({
      lockAddress,
      maxNumberOfKeys: numbersOfKeys as any,
    } as any)
  }

  const updateMaxNumberOfKeysMutation = useMutation(updateMaxNumberOfKeys)

  const onHandleSubmit = async () => {
    if (isValid) {
      await ToastHelper.promise(updateMaxNumberOfKeysMutation.mutateAsync(), {
        loading: 'Updating...',
        success: 'Quantity updated',
        error: 'There is some unexpected issue, please try again',
      })
      setIsOpen(false)
      reset()
    } else {
      ToastHelper.error('Form is not valid')
      setIsOpen(false)
      reset()
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <form
          className="flex flex-col gap-6 p-6 text-left"
          onSubmit={handleSubmit(onHandleSubmit)}
        >
          <span className="text-2xl font-bold">Update Quantity</span>

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
                              type="numeric"
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
              <span className="absolute -mt-1 text-xs text-red-700">
                Please choose a number of memberships for your lock.
              </span>
            )}
          </div>

          <Button type="submit">Update</Button>
        </form>
      </Modal>
      <Button
        variant="secondary"
        size="small"
        className="w-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">Update Quantity</span>
          <EditIcon size={16} />
        </div>
      </Button>
    </>
  )
}
