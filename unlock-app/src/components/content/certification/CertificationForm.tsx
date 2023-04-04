import { useState } from 'react'
import { Lock, Token } from '@unlock-protocol/types'
import { MetadataFormData } from '~/components/interface/locks/metadata/utils'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import {
  Button,
  Disclosure,
  Input,
  TextBox,
  ToggleSwitch,
  ImageUpload,
  Select,
} from '@unlock-protocol/ui'
import { useConfig } from '~/utils/withConfig'
import { useAuth } from '~/contexts/AuthenticationContext'
import { networkDescription } from '~/components/interface/locks/Create/elements/CreateLockForm'
import { useQuery } from '@tanstack/react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { SelectCurrencyModal } from '~/components/interface/locks/Create/modals/SelectCurrencyModal'
import { UNLIMITED_KEYS_DURATION } from '~/constants'
import { CryptoIcon } from '@unlock-protocol/crypto-icon'
import { useImageUpload } from '~/hooks/useImageUpload'
import { BalanceWarning } from '~/components/interface/locks/Create/elements/BalanceWarning'
// TODO replace with zod, but only once we have replaced Lock and MetadataFormData as well
export interface NewEventForm {
  network: number
  lock: Omit<Lock, 'address' | 'key'>
  currencySymbol: string
  metadata: Partial<MetadataFormData>
}

interface FormProps {
  onSubmit: (data: NewEventForm) => void
}

export const CertificationForm = ({ onSubmit }: FormProps) => {
  const { networks } = useConfig()
  const { network, account } = useAuth()

  const [isFree, setIsFree] = useState(true)
  const [unlimitedCapacity, setUnlimitedCapacity] = useState(false)
  const [forever, setForever] = useState(false)
  const [isCurrencyModalOpen, setCurrencyModalOpen] = useState(false)
  const { mutateAsync: uploadImage, isLoading: isUploading } = useImageUpload()

  const web3Service = useWeb3Service()

  const methods = useForm<NewEventForm>({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      network,
      lock: {
        name: '',
        expirationDuration: UNLIMITED_KEYS_DURATION,
        maxNumberOfKeys: 100,
        currencyContractAddress: null,
        keyPrice: '0',
      },
      currencySymbol: networks[network!].nativeCurrency.symbol,
      metadata: {
        description: '',
        certification: {
          issuer: '',
          expire_date: null,
        },
        image: '',
      },
    },
  })

  const {
    control,
    register,
    setValue,
    formState: { errors },
    watch,
  } = methods

  const details = useWatch({
    control,
  })

  const DescDescription = () => (
    <p>
      Give detail about this certificate to increase the credibility.{' '}
      <a
        className="text-brand-ui-primary hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        href="https://www.markdownguide.org/cheat-sheet"
      >
        Markdown is supported.
      </a>
    </p>
  )

  const { isLoading: isLoadingBalance, data: balance } = useQuery(
    ['getBalance', account, details.network],
    async () => {
      if (!details.network) {
        return 1.0
      }
      return parseFloat(
        await web3Service.getAddressBalance(account!, details.network!)
      )
    }
  )

  const networkOptions = Object.values(networks || {})?.map(
    ({ name, id }: any) => {
      return {
        label: name,
        value: id,
      }
    }
  )

  const noBalance = balance === 0 && !isLoadingBalance

  const NetworkDescription = () => {
    return (
      <p>
        This is the network on which your ticketing contract will be deployed.{' '}
        {details.network && <>{networkDescription(details.network)}</>}
      </p>
    )
  }

  const metadataImage = watch('metadata.image')

  return (
    <FormProvider {...methods}>
      <form className="mb-6" onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          <Disclosure label="Basic Information" defaultOpen>
            <p className="mb-5">
              All of these fields can also be adjusted later.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <ImageUpload
                description="This illustration will be used for the NFT tickets. Use 512 by 512 pixels for best results."
                isUploading={isUploading}
                preview={metadataImage!}
                onChange={async (fileOrFileUrl: any) => {
                  if (typeof fileOrFileUrl === 'string') {
                    setValue('metadata.image', fileOrFileUrl)
                  } else {
                    const items = await uploadImage(fileOrFileUrl[0])
                    const image = items?.[0]?.publicUrl
                    if (!image) {
                      return
                    }
                    setValue('metadata.image', image)
                  }
                }}
              />
              <div className="grid gap-4">
                <Input
                  {...register('lock.name', {
                    required: {
                      value: true,
                      message: 'Name is required',
                    },
                  })}
                  type="text"
                  placeholder="Name"
                  label="Certification Name"
                  description={
                    'Enter program, course name to have recipient show off what they have completed.'
                  }
                  error={errors.lock?.name?.message}
                />

                <TextBox
                  {...register('metadata.description', {
                    required: {
                      value: true,
                      message: 'Please add a description for your event',
                    },
                  })}
                  label="Description"
                  placeholder="Write description here."
                  description={<DescDescription />}
                  rows={4}
                  error={errors.metadata?.description?.message as string}
                />

                <Input
                  {...register('metadata.certification.issuer', {
                    required: {
                      value: true,
                      message: 'Please add a description for your event',
                    },
                  })}
                  label="Official Name of the Issuer"
                  description="This is part of metadata to store the official name of issuer"
                  error={errors.metadata?.description?.message as string}
                />

                <div>
                  <div className="flex items-center justify-between">
                    <label className="px-1 mb-2 text-base" htmlFor="">
                      Certificate Expire Date
                    </label>
                    <ToggleSwitch
                      title="Forever"
                      enabled={forever}
                      setEnabled={setForever}
                      onChange={(enable: boolean) => {
                        if (enable) {
                          setValue('metadata.certification.expire_date', null)
                        }
                      }}
                    />
                  </div>
                  <Input
                    type="date"
                    disabled={forever}
                    {...register('metadata.certification.expire_date')}
                  />
                </div>
              </div>
            </div>
          </Disclosure>

          <Disclosure label="Price & Quantity" defaultOpen>
            <div className="grid gap-6">
              <p>
                These settings can also be changed, but only by sending on-chain
                transactions.
              </p>
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
                      if (enable) {
                        setValue('lock.keyPrice', '0')
                      }
                    }}
                  />
                </div>
                <div className="relative">
                  <SelectCurrencyModal
                    isOpen={isCurrencyModalOpen}
                    setIsOpen={setCurrencyModalOpen}
                    network={Number(details.network)}
                    onSelect={(token: Token) => {
                      setValue('lock.currencyContractAddress', token.address)
                      setValue('currencySymbol', token.symbol)
                    }}
                  />
                  <div className="grid grid-cols-2 gap-2 justify-items-stretch">
                    <div className="flex flex-col gap-1.5">
                      <div
                        onClick={() => setCurrencyModalOpen(true)}
                        className="box-border flex items-center flex-1 w-full gap-2 pl-4 text-base text-left transition-all border border-gray-400 rounded-lg shadow-sm cursor-pointer hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none"
                      >
                        <CryptoIcon symbol={details.currencySymbol!} />
                        <span>{details.currencySymbol}</span>
                      </div>
                      <div className="pl-1"></div>
                    </div>

                    <Input
                      type="number"
                      autoComplete="off"
                      placeholder="0.00"
                      step={0.01}
                      disabled={isFree}
                      {...register('lock.keyPrice', {
                        required: !isFree,
                      })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="px-1 mb-2 text-base" htmlFor="">
                    Capacity
                  </label>
                  <ToggleSwitch
                    title="Unlimited"
                    enabled={unlimitedCapacity}
                    setEnabled={setUnlimitedCapacity}
                    onChange={(enable: boolean) => {
                      if (enable) {
                        setValue('lock.maxNumberOfKeys', 0)
                      }
                    }}
                  />
                </div>
                <Input
                  {...register('lock.maxNumberOfKeys', {
                    min: 0,
                    required: {
                      value: true,
                      message: 'Capacity is required. ',
                    },
                  })}
                  disabled={unlimitedCapacity}
                  autoComplete="off"
                  step={1}
                  pattern="\d+"
                  type="number"
                  placeholder="Capacity"
                  description={
                    'This is the maximum number of tickets for your event. '
                  }
                />
              </div>
            </div>
          </Disclosure>

          <Disclosure label="Additional">
            <div className="grid gap-6">
              <Select
                onChange={(newValue) => {
                  setValue('network', Number(newValue))
                  setValue('lock.currencyContractAddress', null)
                  setValue(
                    'currencySymbol',
                    networks[newValue].nativeCurrency.symbol
                  )
                }}
                options={networkOptions}
                label="Network"
                defaultValue={network}
                description={<NetworkDescription />}
              />
              <div className="mb-4">
                {noBalance && (
                  <BalanceWarning
                    network={details.network!}
                    balance={balance}
                  />
                )}
              </div>
            </div>
          </Disclosure>

          <div className="flex flex-col justify-center gap-6">
            {Object.keys(errors).length > 0 && (
              <div className="px-2 text-red-600">
                Please make sure you complete all the required fields.
              </div>
            )}
            <Button
              disabled={Object.keys(errors).length > 0}
              className="w-full"
            >
              Save & Deploy
            </Button>
            <span className="text-base text-center">
              You can always change any detail after the contract is deployed.
            </span>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
