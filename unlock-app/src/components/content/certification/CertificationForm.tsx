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
  Icon,
} from '@unlock-protocol/ui'
import { useConfig } from '~/utils/withConfig'
import { useAuth } from '~/contexts/AuthenticationContext'
import { networkDescription } from '~/components/interface/locks/Create/elements/CreateLockForm'
import { SelectCurrencyModal } from '~/components/interface/locks/Create/modals/SelectCurrencyModal'
import { CryptoIcon } from '@unlock-protocol/crypto-icon'
import { useImageUpload } from '~/hooks/useImageUpload'
import { BalanceWarning } from '~/components/interface/locks/Create/elements/BalanceWarning'
import { getAccountTokenBalance } from '~/hooks/useAccount'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { useQuery } from '@tanstack/react-query'
import { FaArrowLeft as ArrowLeftIcon } from 'react-icons/fa'
import Link from 'next/link'

// TODO replace with zod, but only once we have replaced Lock and MetadataFormData as well
export interface NewCertificationForm {
  network: number
  lock: Omit<Lock, 'address' | 'key'>
  currencySymbol: string
  metadata: Partial<MetadataFormData>
}

interface FormProps {
  onSubmit: (data: NewCertificationForm) => void
}

export const CertificationForm = ({ onSubmit }: FormProps) => {
  const { networks } = useConfig()
  const { network, account } = useAuth()

  const [isFree, setIsFree] = useState(true)
  const [unlimitedCapacity, setUnlimitedCapacity] = useState(false)
  const [allowPurchase, setAllowPurchase] = useState(false)
  const [forever, setForever] = useState(true)
  const [isCurrencyModalOpen, setCurrencyModalOpen] = useState(false)
  const { mutateAsync: uploadImage, isLoading: isUploading } = useImageUpload()

  const methods = useForm<NewCertificationForm>({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      network,
      lock: {
        name: '',
        expirationDuration: undefined,
        maxNumberOfKeys: 0,
        currencyContractAddress: null,
        keyPrice: '0',
      },
      currencySymbol: networks[network!].nativeCurrency.symbol,
      metadata: {
        external_url: '',
        description: '',
        image: '',
        certification: {
          certification_issuer: '',
        },
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
      Provide a description for the certification. This will be part of the NFT
      metadata.{' '}
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

  const { data: balance, isLoading: isLoadingBalance } = useQuery(
    ['getBalance', account, network],
    async () => {
      return await getAccountTokenBalance(Web3Service, account!, null, network!)
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

  const noBalance = balance && parseFloat(balance) === 0 && !isLoadingBalance

  const NetworkDescription = () => {
    return (
      <p>
        This is the network on which your certification contract will be
        deployed.{' '}
        {details.network && <>{networkDescription(details.network)}</>}
      </p>
    )
  }

  const metadataImage = watch('metadata.image')

  return (
    <FormProvider {...methods}>
      <div className="grid grid-cols-[50px_1fr_50px] items-center mb-4">
        <Link href="/certification">
          <Icon icon={ArrowLeftIcon} />
        </Link>
        <h1 className="text-xl font-bold text-center text-brand-dark">
          Creating Certification
        </h1>
      </div>
      <form className="mb-6" onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          <Disclosure label="Basic Information" defaultOpen>
            <p className="mb-5">
              All of these fields can also be adjusted later.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <ImageUpload
                  description="This illustration will be used for the NFT certificate. Use 512 by 512 pixels for best results."
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
              </div>
              <div className="grid gap-2">
                <Input
                  {...register('lock.name', {
                    required: {
                      value: true,
                      message: 'Name is required',
                    },
                  })}
                  type="text"
                  placeholder="Name"
                  label="Certification name"
                  description={
                    'Enter the program or course name that was completed by the recipient of the certification.'
                  }
                  error={errors.lock?.name?.message}
                />

                <TextBox
                  {...register('metadata.description', {
                    required: {
                      value: true,
                      message: 'Please add a description for your certificate',
                    },
                  })}
                  label="Description"
                  placeholder="Write description here."
                  description={<DescDescription />}
                  rows={4}
                  error={errors.metadata?.description?.message as string}
                />

                <Input
                  {...register('metadata.certification.certification_issuer', {
                    required: {
                      value: true,
                      message: 'Please add an issuer name',
                    },
                  })}
                  label="Official name of the issuer"
                  description="This is part of NFT metadata."
                  error={
                    // @ts-expect-error Property 'certification_issuer' does not exist on type 'FieldError | Merge<FieldError, FieldErrorsImpl<any>>'.
                    errors.metadata?.certification?.certification_issuer
                      ?.message as string
                  }
                />

                <Input
                  {...register('metadata.external_url')}
                  label="External URL"
                  description="Include a link to the organization that performed the certification. This will be included in the NFT metadata."
                  error={errors.metadata?.external_url?.message as string}
                />

                <div>
                  <div className="flex items-center justify-between">
                    <label className="px-1 mb-2 text-base" htmlFor="">
                      Certification duration (in days)
                    </label>
                    <ToggleSwitch
                      title="Forever"
                      enabled={forever}
                      setEnabled={setForever}
                      onChange={(enabled) => {
                        if (enabled) {
                          setValue('lock.expirationDuration', '' as any, {
                            shouldValidate: true,
                          })
                        }
                      }}
                    />
                  </div>
                  <Input
                    disabled={forever}
                    error={errors.lock?.expirationDuration?.message as string}
                    {...register('lock.expirationDuration', {
                      required: {
                        value: !forever,
                        message: 'Please add a duration',
                      },
                    })}
                  />
                </div>
              </div>
            </div>
          </Disclosure>

          <Disclosure label="Price & Quantity" defaultOpen>
            <div className="grid gap-6">
              <p>These settings can also be changed later.</p>

              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <label className="px-1 mb-2 text-base">
                    Can certifications be purchased?
                  </label>
                  <ToggleSwitch
                    enabled={allowPurchase}
                    setEnabled={setAllowPurchase}
                    onChange={(enable: boolean) => {
                      if (!enable) {
                        setValue('lock.maxNumberOfKeys', 0, {
                          shouldValidate: true,
                        })
                        setValue('lock.keyPrice', '0', {
                          shouldValidate: true,
                        })
                      }
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {`By default you certification can't be purchased.
                  If enabled, and there is enough capacity user can buy the certification.`}
                </span>
              </div>

              {allowPurchase && (
                <>
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
                            setValue('lock.keyPrice', '0', {
                              shouldValidate: true,
                            })
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
                          setValue(
                            'lock.currencyContractAddress',
                            token.address
                          )
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

                        <div className="relative">
                          <Input
                            type="number"
                            autoComplete="off"
                            placeholder="0.00"
                            step={0.01}
                            disabled={isFree}
                            {...register('lock.keyPrice', {
                              required: {
                                value: !isFree,
                                message: 'This value is required',
                              },
                            })}
                          />
                          {errors?.lock?.keyPrice?.message && (
                            <span className="absolute -mb-4 text-sm text-red-500">
                              {errors?.lock?.keyPrice?.message}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="px-1 mb-2 text-base" htmlFor="">
                        Number of certifications for sale
                      </label>
                      <ToggleSwitch
                        disabled={!allowPurchase}
                        title="Unlimited"
                        enabled={unlimitedCapacity}
                        setEnabled={setUnlimitedCapacity}
                        onChange={(enable: boolean) => {
                          if (enable) {
                            setValue('lock.maxNumberOfKeys', undefined, {
                              shouldValidate: true,
                            })
                          }
                        }}
                      />
                    </div>
                    <Input
                      {...register('lock.maxNumberOfKeys', {
                        min: 0,
                        required: {
                          value: !unlimitedCapacity,
                          message: 'This value is required',
                        },
                      })}
                      disabled={unlimitedCapacity || !allowPurchase}
                      autoComplete="off"
                      step={1}
                      pattern="\d+"
                      type="number"
                      placeholder="Number of certifications for sale"
                      description={
                        'This is the maximum number of certifications available.'
                      }
                      error={errors?.lock?.maxNumberOfKeys?.message}
                    />
                  </div>
                </>
              )}
            </div>
          </Disclosure>

          <Disclosure label="Network" defaultOpen>
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
                    balance={parseFloat(balance)}
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
