import { config } from '~/config/app'
import { useState } from 'react'
import { Token } from '@unlock-protocol/types'
import { MetadataFormData } from '~/components/interface/locks/metadata/utils'
import { FormProvider, useForm, Controller, useWatch } from 'react-hook-form'
import {
  Button,
  Disclosure,
  Input,
  TextBox,
  Select,
  ToggleSwitch,
} from '@unlock-protocol/ui'
import { useConfig } from '~/utils/withConfig'
import { useAuth } from '~/contexts/AuthenticationContext'
import { networkDescription } from '~/components/interface/locks/Create/elements/CreateLockForm'
import { useQuery } from '@tanstack/react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { BalanceWarning } from '~/components/interface/locks/Create/elements/BalanceWarning'
import { SelectCurrencyModal } from '~/components/interface/locks/Create/modals/SelectCurrencyModal'
import { CryptoIcon } from '~/components/interface/locks/elements/KeyPrice'
import { UNLIMITED_KEYS_DURATION } from '~/constants'

export const Form = () => {
  const { networks } = useConfig()
  const { network, account } = useAuth()
  const [isFree, setIsFree] = useState(true)
  const [isCurrencyModalOpen, setCurrencyModalOpen] = useState(false)

  const web3Service = useWeb3Service()

  const methods = useForm<MetadataFormData>({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      network,
      lock: {
        expirationDuration: UNLIMITED_KEYS_DURATION,
        maxNumberOfKeys: 100,
        currencyContractAddress: null,
        keyPrice: 0,
      },
      currency: {
        symbol: networks[network!].baseCurrencySymbol,
      },
      formData: {
        name,
        description: '',
        ticket: {
          event_start_date: '',
          event_start_time: '',
          event_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          event_address: '',
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
  } = methods

  const onSubmit = async (formData: MetadataFormData) => {
    console.log(formData)
  }

  const details = useWatch({
    control,
  })

  const errorFields = Object.keys(errors)

  const DescDescription = () => (
    <p>
      Enter a description for your event.{' '}
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

  const mapAddress = `https://www.google.com/maps/embed/v1/place?q=${encodeURIComponent(
    details.formData?.event?.event_address || 'Ethereum'
  )}&key=${config.googleMapsApiKey}`

  const networkOptions = Object.values(networks || {})?.map(
    ({ name, id }: any) => {
      return {
        label: name,
        value: id,
      }
    }
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
  const noBalance = balance === 0 && !isLoadingBalance

  const NetworkDescription = () => {
    return (
      <p>
        This is the network on which your ticketing contract will be deployed.{' '}
        {networkDescription(details.network)}
      </p>
    )
  }

  return (
    <FormProvider {...methods}>
      <form className="mb-6" onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          <Disclosure label="Basic Information" defaultOpen>
            <p className="mb-5">
              Please complete the following details. All of these can also be
              adjusted later.
            </p>
            <div className="grid gap-6">
              <Input
                {...register('formData.name', {
                  required: {
                    value: true,
                    message: 'Name is required',
                  },
                })}
                type="text"
                placeholder="Name"
                label="Event Name"
                description={
                  'Enter the name of your event. It will appear on the NFT tickets.'
                }
              />

              <TextBox
                {...register('formData.description')}
                label="Description"
                placeholder="Write description here."
                description={<DescDescription />}
                rows={4}
              />

              <Input
                {...register('formData.image', {})}
                type="url"
                placeholder="Please enter an image URL"
                label="Illustration"
                description={
                  'This illustration will be used for the NFT tickets.'
                }
              />

              <Select
                onChange={(newValue) => {
                  setValue('network', newValue)
                  setValue('lock.currencyContractAddress', null)
                  setValue(
                    'currency.symbol',
                    networks[newValue].baseCurrencySymbol
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

          <Disclosure label="Location, date and time" defaultOpen>
            <div className="grid gap-6">
              <p className="mb-5">
                This information will be public and included on each of the NFT
                tickets. There again, it can be adjusted later.
              </p>
              <div className="grid items-center align-top	gap-4 sm:grid-cols-2">
                <div className="flex flex-col self-start justify-top gap-4">
                  <div className="h-80">
                    <iframe width="100%" height="300" src={mapAddress}></iframe>
                  </div>
                </div>
                <div className="flex flex-col self-start justify-top">
                  <Input
                    {...register('formData.ticket.event_start_date')}
                    type="date"
                    label="Date"
                  />
                  <Input
                    {...register('formData.ticket.event_start_time')}
                    type="time"
                    label="Time"
                  />

                  <Controller
                    name="formData.ticket.event_timezone"
                    control={control}
                    render={({ field: { onChange, value } }) => {
                      return (
                        <Select
                          onChange={(newValue) => {
                            onChange({
                              target: {
                                value: newValue,
                              },
                            })
                          }}
                          // @ts-expect-error supportedValuesOf
                          options={Intl.supportedValuesOf('timeZone').map(
                            (tz: string) => {
                              return {
                                value: tz,
                                label: tz,
                              }
                            }
                          )}
                          label="Timezone"
                          defaultValue={value}
                        />
                      )
                    }}
                  />

                  <Input
                    {...register('formData.ticket.event_address')}
                    type="text"
                    placeholder="123 1st street, 11217 Springfield, US"
                    label="Address for in person event"
                  />
                </div>
              </div>
            </div>
          </Disclosure>

          <Disclosure label="Price and capacity" defaultOpen>
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
                      setValue('lock.keyPrice', enable ? 0 : undefined)
                    }}
                  />
                </div>
                <div className="relative">
                  <SelectCurrencyModal
                    isOpen={isCurrencyModalOpen}
                    setIsOpen={setCurrencyModalOpen}
                    network={details.network}
                    onSelect={(token: Token) => {
                      setValue('lock.currencyContractAddress', token.address)
                      setValue('currency.symbol', token.symbol)
                    }}
                  />
                  <div className="grid grid-cols-2 gap-2 justify-items-stretch">
                    <div className="flex flex-col gap-1.5">
                      <div
                        onClick={() => setCurrencyModalOpen(true)}
                        className="box-border flex items-center flex-1 w-full gap-2 pl-4 text-base text-left transition-all border border-gray-400 rounded-lg shadow-sm cursor-pointer hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none"
                      >
                        <CryptoIcon symbol={details.currency.symbol} />
                        <span>{details.currency.symbol}</span>
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

              <Input
                {...register('lock.maxNumberOfKeys', {
                  min: 0,
                  required: {
                    value: true,
                    message: 'Capacity is required. ',
                  },
                })}
                autoComplete="off"
                step={1}
                pattern="\d+"
                type="number"
                placeholder="Capacity"
                label="Capacity"
                description={
                  'This is the maximum number of tickets for your event. '
                }
              />
            </div>
          </Disclosure>

          <div className="flex flex-col justify-center gap-6">
            {errorFields.length > 0 && (
              <div className="px-2 text-red-600">
                You need fix the issues in the following fields before deploying
                your contract: {errorFields.join(',')}
              </div>
            )}
            <Button disabled={errorFields.length > 0} className="w-full">
              Deploy your contract
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
