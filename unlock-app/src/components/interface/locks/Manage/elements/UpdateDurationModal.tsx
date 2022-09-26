import { Modal, Input, Button, Icon } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { AiOutlineEdit as EditIcon } from 'react-icons/ai'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWalletService } from '~/utils/withWalletService'
import { useMutation } from 'react-query'
import { RadioGroup } from '@headlessui/react'
import {
  MdRadioButtonUnchecked as UncheckedIcon,
  MdRadioButtonChecked as CheckedIcon,
} from 'react-icons/md'
import { MAX_UINT, ONE_DAY_IN_SECONDS } from '~/constants'

interface EditFormProps {
  expirationDuration?: string | number
  unlimitedDuration?: boolean
}

interface UpdateDurationModalProps {
  lockAddress: string
  onUpdate?: () => void
}

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

export const UpdateDurationModal = ({
  lockAddress,
  onUpdate,
}: UpdateDurationModalProps) => {
  const walletService = useWalletService()
  const [isOpen, setIsOpen] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    control,
    reset,
    formState: { isValid, errors },
    resetField,
  } = useForm<EditFormProps>({
    mode: 'onChange',
    defaultValues: {
      unlimitedDuration: true,
      expirationDuration: undefined,
    },
  })

  useEffect(() => {
    if (!isOpen) return
    reset()
  }, [isOpen, reset])

  const updateDuration = async (): Promise<any> => {
    const { unlimitedDuration, expirationDuration: duration } = getValues()

    const expirationInSeconds = parseInt(`${duration}`) * ONE_DAY_IN_SECONDS
    const expirationDuration = unlimitedDuration
      ? MAX_UINT
      : expirationInSeconds
    return await walletService.setExpirationDuration({
      lockAddress,
      expirationDuration: expirationDuration!,
    } as any)
  }

  const updateDurationMutation = useMutation(updateDuration)

  const onHandleSubmit = async () => {
    if (isValid) {
      await ToastHelper.promise(updateDurationMutation.mutateAsync(), {
        loading: 'Updating...',
        success: 'Duration updated',
        error: 'There is some unexpected issue, please try again',
      })
      setIsOpen(false)
      reset()
      if (typeof onUpdate === 'function') {
        onUpdate()
      }
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
          <span className="text-2xl font-bold">Update Duration</span>

          <div>
            <label className="block px-1 mb-4 text-base" htmlFor="">
              Memberships duration (days):
            </label>
            <Controller
              control={control}
              name="unlimitedDuration"
              render={({ field: { value = '', onChange } }) => {
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
                                step={0.01}
                                {...register('expirationDuration', {
                                  required: value !== true,
                                  min: 0,
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

          <Button type="submit">Update</Button>
        </form>
      </Modal>
      <Button
        variant="outlined-primary"
        size="tiny"
        className="p-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        <EditIcon size={16} />
      </Button>
    </>
  )
}
