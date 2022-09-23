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
import { CryptoIcon } from '../../elements/KeyPrice'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useMutation, useQuery } from 'react-query'

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
  keyPrice?: undefined
}

interface EditDurationAndQuantityProps {
  lockAddress: string
  network: number
}

export const EditPriceAndQuantity = ({
  lockAddress,
  network,
}: EditDurationAndQuantityProps) => {
  const walletService = useWalletService()
  const web3Service = useWeb3Service()
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
      keyPrice: undefined,
    },
  })

  useEffect(() => {
    if (!isOpen) return
    reset()
  }, [isOpen, reset])

  const getLock = async () => {
    return await web3Service.getLock(lockAddress, network)
  }

  const getSymbol = async () => {
    return await web3Service.getTokenSymbol(lockAddress, network)
  }

  const { data: symbol } = useQuery(
    ['getSymbol', lockAddress, network],
    async () => getSymbol()
  )

  const { data: lock } = useQuery(['getLock', lockAddress, network], async () =>
    getLock()
  )

  const updatePrice = async (): Promise<any> => {
    const { keyPrice = '' } = getValues()

    if (keyPrice.length === 0) return
    return await walletService.updateKeyPrice({
      lockAddress,
      keyPrice,
    } as any)
  }

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

  const updatePriceMutation = useMutation(updatePrice)
  const updateMaxNumberOfKeysMutation = useMutation(updateMaxNumberOfKeys)

  const updatePromise = async (): Promise<any> => {
    const { keyPrice, maxNumberOfKeys, unlimitedQuantity } = getValues()
    const numbersOfKeys = unlimitedQuantity
      ? UNLIMITED_KEYS_COUNT
      : maxNumberOfKeys

    const promises = []

    const priceChanged = keyPrice != lock?.keyPrice
    const numbersOfKeysChanged = numbersOfKeys != lock?.maxNumberOfKeys

    if (priceChanged) {
      promises.push(updatePriceMutation.mutateAsync())
    }

    if (numbersOfKeysChanged) {
      promises.push(updateMaxNumberOfKeysMutation.mutateAsync())
    }
    return await Promise.all(promises)
  }

  const onHandleSubmit = async () => {
    if (isValid) {
      await ToastHelper.promise(updatePromise(), {
        loading: 'Updating...',
        success: 'Price and duration updated',
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
          <span className="text-2xl font-bold">Update Price / Quantity</span>

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

          <div>
            <label className="block px-1 mb-2 text-base" htmlFor="">
              Currency & Price:
            </label>
            <div className="grid grid-cols-5 gap-1 justify-items-stretch">
              <div className="flex flex-col gap-1.5 col-span-1">
                <div
                  onClick={() => setIsOpen(true)}
                  className="box-border flex items-center flex-1 w-full gap-2 text-base text-left transition-all rounded-lg"
                >
                  <CryptoIcon symbol={symbol} />
                  <span>{symbol}</span>
                </div>
                <div className="pl-1"></div>
              </div>

              <div className="relative col-span-4">
                <Input
                  type="numeric"
                  autoComplete="off"
                  placeholder="0.00"
                  step={0.01}
                  {...register('keyPrice', {
                    min: 0,
                  })}
                />
              </div>
            </div>
            {errors?.keyPrice && (
              <span className="absolute -mt-1 text-xs text-red-700">
                Please enter a positive number
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
          <span className="text-sm">Update Price / Quantity</span>
          <EditIcon size={16} />
        </div>
      </Button>
    </>
  )
}
