import { FaRegLightbulb } from 'react-icons/fa'
import { usePlacesWidget } from 'react-google-autocomplete'
import { config } from '~/config/app'
import { useEffect, useState } from 'react'
import { Lock, Token } from '@unlock-protocol/types'
import { BsArrowLeft as ArrowBackIcon } from 'react-icons/bs'
import { BiLogoZoom as ZoomIcon } from 'react-icons/bi'
import { MetadataFormData } from '~/components/interface/locks/metadata/utils'
import { FormProvider, useForm, Controller, useWatch } from 'react-hook-form'
import {
  Button,
  Disclosure,
  Input,
  TextBox,
  Select,
  ToggleSwitch,
  ImageUpload,
  Checkbox,
  Combobox,
} from '@unlock-protocol/ui'
import { useConfig } from '~/utils/withConfig'
import { NetworkDescription } from '~/components/interface/locks/Create/elements/CreateLockForm'
import { useQuery } from '@tanstack/react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { BalanceWarning } from '~/components/interface/locks/Create/elements/BalanceWarning'
import { NetworkWarning } from '~/components/interface/locks/Create/elements/NetworkWarning'
import { SelectCurrencyModal } from '~/components/interface/locks/Create/modals/SelectCurrencyModal'
import { UNLIMITED_KEYS_DURATION } from '~/constants'
import { CryptoIcon } from '@unlock-protocol/crypto-icon'
import { useImageUpload } from '~/hooks/useImageUpload'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { useAvailableNetworks } from '~/utils/networks'
import Link from 'next/link'
import { regexUrlPattern } from '~/utils/regexUrlPattern'
import { ProtocolFee } from '~/components/interface/locks/Create/elements/ProtocolFee'
import { useAuthenticate } from '~/hooks/useAuthenticate'

// TODO replace with zod, but only once we have replaced Lock and MetadataFormData as well
export interface NewEventForm {
  network: number
  lock: Omit<Lock, 'address' | 'key'>
  currencySymbol: string
  metadata: Partial<MetadataFormData>
}

interface GoogleMapsAutoCompleteProps {
  onChange: (address: string, location: string, timezone: string) => void
  defaultValue?: string
}

export const GoogleMapsAutoComplete = ({
  onChange,
  defaultValue,
}: GoogleMapsAutoCompleteProps) => {
  const onPlaceSelected = async (place: any, inputRef: any) => {
    const lat = place.geometry?.location?.lat()
    const lng = place.geometry?.location?.lng()

    //  We use a dedicated API key because this Timezone API  does not support restricting by referrers as of Sept 2024
    const timezoneInfo = await fetch(
      `https://maps.googleapis.com/maps/api/timezone/json?location=${lat}%2C${lng}&timestamp=${Math.floor(new Date().getTime() / 1000)}&key=AIzaSyB7AMd20omjPeJRS2rDBbq8HKZIoRZQD_o`
    ).then((response) => response.json())

    if (place.formatted_address) {
      return onChange(
        inputRef.value,
        place.formatted_address,
        timezoneInfo.timeZoneId
      )
    }
    return onChange(inputRef.value, inputRef.value, timezoneInfo.timeZoneId)
  }

  const { ref } = usePlacesWidget({
    options: {
      types: [],
    },
    apiKey: config.googleMapsApiKey,
    onPlaceSelected: (place: any, inputRef: any) => {
      onPlaceSelected(place, inputRef)
    },
  })

  return (
    <Input
      defaultValue={defaultValue}
      // @ts-expect-error Type 'RefObject<null>' is not assignable to type 'Ref<HTMLInputElement> | undefined'.
      ref={ref}
      type="text"
      placeholder="123 1st street, 11217 Springfield, US"
    />
  )
}

interface FormProps {
  onSubmit: (data: NewEventForm) => void
  compact?: boolean
}

export const Form = ({ onSubmit, compact = false }: FormProps) => {
  const [oldMaxNumberOfKeys, setOldMaxNumberOfKeys] = useState<number>(0)
  const { networks } = useConfig()
  const { account } = useAuthenticate()
  const [isInPerson, setIsInPerson] = useState(true)
  const [screeningEnabled, enableScreening] = useState(false)
  const [isUnlimitedCapacity, setIsUnlimitedCapacity] = useState(false)
  const [attendeeRefund, setAttendeeRefund] = useState(false)
  const [isFree, setIsFree] = useState(true)
  const [isCurrencyModalOpen, setCurrencyModalOpen] = useState(false)
  const { mutateAsync: uploadImage, isPending: isUploading } = useImageUpload()

  const web3Service = useWeb3Service()

  const today = dayjs().format('YYYY-MM-DD')
  const networkOptions = useAvailableNetworks()
  const moreNetworkOptions = useAvailableNetworks(true)
  const network = networkOptions[0]?.value

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
      currencySymbol: networks[network].nativeCurrency.symbol,
      metadata: {
        description: '',
        ticket: {
          event_start_date: today,
          event_start_time: '',
          event_end_date: today,
          event_end_time: '',
          event_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          event_is_in_person: true,
          event_address: '',
          event_location: '',
        },
        image: '',
        requiresApproval: false,
        emailSender: '',
      },
    },
  })

  const {
    control,
    register,
    trigger,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
    watch,
  } = methods
  const details = useWatch({
    control,
  })

  const [mapAddress, setMapAddress] = useState(
    encodeURIComponent(getValues('metadata.ticket.event_address') || 'Ethereum')
  )

  const { isPending: isLoadingBalance, data: balance } = useQuery({
    queryKey: ['getBalance', account, details.network],
    queryFn: async () => {
      if (!details.network) {
        return 1.0
      }
      return parseFloat(
        await web3Service.getAddressBalance(account!, details.network!)
      )
    },
  })

  const noBalance = balance === 0 && !isLoadingBalance

  const ticket = details?.metadata?.ticket

  const metadataImage = watch('metadata.image')
  const isSameDay = dayjs(ticket?.event_end_date).isSame(
    ticket?.event_start_date,
    'day'
  )

  const minEndTime = isSameDay ? ticket?.event_start_time : undefined
  const minEndDate = dayjs(ticket?.event_start_date).format('YYYY-MM-DD')

  const router = useRouter()

  const [currencyNetwork, setCurrencyNetwork] = useState<string>()
  const [kickbackSupported, setKickBackSupported] = useState<boolean>(false)

  register('metadata.image', {
    required: {
      value: true,
      message: 'Please select an image to illustrate your event!',
    },
    pattern: {
      value:
        /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]*)*[\w\-._~:/?#[\]@!$&'()*+,;=.]*$/,
      message: 'Please, use a valid image URL',
    },
  })

  const processAndSubmit = (values: any) => {
    if (attendeeRefund) {
      values.metadata.attendeeRefund = {
        amount: values.lock!.keyPrice,
        currency: values.lock!.currencyContractAddress,
        network: values.network,
      }
    }
    onSubmit(values)
  }

  const [kickbackDisabled, setKickbackDisabled] = useState<boolean>(false)
  useEffect(() => {
    if (isFree || !kickbackSupported) {
      setKickbackDisabled(true)
      setAttendeeRefund(false)
    } else {
      setKickbackDisabled(false)
    }
  }, [isFree, details.lock?.keyPrice, kickbackSupported])

  return (
    <FormProvider {...methods}>
      {!compact && (
        <div
          className={`grid ${compact ? '' : 'grid-cols-[50px_1fr_50px]'} items-center mb-4`}
        >
          <Button variant="borderless" aria-label="arrow back">
            <ArrowBackIcon
              size={20}
              className="cursor-pointer"
              onClick={() => router.back()}
            />
          </Button>
          <h1 className="text-xl font-bold text-center text-brand-dark">
            Creating your Event
          </h1>
        </div>
      )}

      <form className="mb-6" onSubmit={methods.handleSubmit(processAndSubmit)}>
        <div className="grid gap-6">
          <Disclosure label="Basic Information" defaultOpen>
            <p className="mb-5">
              All of these fields can also be adjusted later.
            </p>

            <div
              className={`grid grid-cols-1 gap-4 ${compact ? '' : 'md:grid-cols-2'}`}
            >
              <div className={`order-2 ${compact ? '' : 'md:order-1'}`}>
                <ImageUpload
                  description="This illustration will be used for your event page, as well as the NFT tickets by default. Use 512 by 512 pixels for best results."
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
                    trigger('metadata.image')
                  }}
                  error={errors.metadata?.image?.message as string}
                />
              </div>
              <div
                className={`grid order-1 gap-4 ${compact ? '' : 'md:order-2'}`}
              >
                <Input
                  {...register('lock.name', {
                    required: {
                      value: true,
                      message: 'Name is required',
                    },
                  })}
                  type="text"
                  placeholder="Name"
                  label="Event name"
                  description={
                    'Enter the name of your event. It will appear on the NFT tickets.'
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
                  description={
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
                  }
                  rows={4}
                  error={errors.metadata?.description?.message as string}
                />

                <Controller
                  name="network"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Combobox
                      options={networkOptions}
                      moreOptions={moreNetworkOptions}
                      initialSelected={networkOptions.find(
                        (option) => option.value === value
                      )}
                      onSelect={(option) => {
                        const newValue = Number(option.value)
                        onChange(newValue)
                        setValue('network', newValue)
                        setValue('lock.currencyContractAddress', null)
                        setValue(
                          'currencySymbol',
                          networks[newValue].nativeCurrency.symbol
                        )
                        setCurrencyNetwork(networks[newValue].name)
                        setKickBackSupported(
                          !!networks[newValue].kickbackAddress
                        )
                      }}
                      label="Network"
                      description={
                        <div className="flex flex-col gap-2">
                          {details.network && (
                            <NetworkDescription network={details.network} />
                          )}
                          <p>
                            This is the network on which your ticketing contract
                            will be deployed.{' '}
                            <Link
                              className="underline text-brand-ui-primary "
                              target="_blank"
                              href="https://unlock-protocol.com/guides/how-to-choose-a-network-for-your-smart-contract-deployment/"
                            >
                              Read our guide
                            </Link>{' '}
                            on how to choose the right network.
                          </p>
                        </div>
                      }
                    />
                  )}
                />
                <NetworkWarning network={details.network} />

                <div className="mb-4">
                  {noBalance && (
                    <BalanceWarning
                      network={details.network!}
                      balance={balance}
                    />
                  )}
                </div>
              </div>
            </div>
          </Disclosure>

          <Disclosure label="Location, Date and Time" defaultOpen>
            <div className="grid">
              <p className="mb-5">
                This information will be public and included on each of the NFT
                tickets. Again, it can be adjusted later.
              </p>
              <div
                className={`grid items-center gap-4 align-top ${compact ? '' : 'sm:grid-cols-2'}`}
              >
                <div className="flex flex-col self-start gap-4 justify-top">
                  <div className="h-80">
                    {isInPerson && (
                      <iframe
                        width="100%"
                        height="350"
                        src={`https://www.google.com/maps/embed/v1/place?q=${encodeURIComponent(
                          mapAddress
                        )}&key=${config.googleMapsApiKey}`}
                      ></iframe>
                    )}
                    {!isInPerson && (
                      <div className="flex h-80 items-center justify-center">
                        <ZoomIcon size="5rem" color={'rgb(96 61 235)'} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-4 self-start">
                  {/* Location */}
                  <div className="flex flex-col gap-0">
                    <div className="flex items-center justify-between">
                      <label className="px-1 mb-2 text-base" htmlFor="">
                        Location
                      </label>
                      <ToggleSwitch
                        title="In person"
                        enabled={isInPerson}
                        setEnabled={setIsInPerson}
                        onChange={(enabled) => {
                          setValue(
                            'metadata.ticket.event_is_in_person',
                            enabled
                          )
                          // reset the value
                          setValue('metadata.ticket.event_address', undefined)

                          if (!enabled) {
                            setError('metadata.ticket.event_address', {
                              type: 'manual',
                              message: 'Please enter a valid URL',
                            })
                          } else {
                            clearErrors('metadata.ticket.event_address')
                          }
                        }}
                      />
                    </div>

                    {!isInPerson && (
                      <Input
                        {...register('metadata.ticket.event_address', {
                          required: {
                            value: true,
                            message: 'Add a link to your event',
                          },
                        })}
                        onChange={(event) => {
                          if (!regexUrlPattern.test(event.target.value)) {
                            setError('metadata.ticket.event_address', {
                              type: 'manual',
                              message: 'Please enter a valid URL',
                            })
                          } else {
                            clearErrors('metadata.ticket.event_address')
                          }
                        }}
                        type="text"
                        placeholder={'Zoom or Google Meet Link'}
                        error={
                          // @ts-expect-error Property 'event_address' does not exist on type 'FieldError | Merge<FieldError, FieldErrorsImpl<any>>'.
                          errors.metadata?.ticket?.event_address
                            ?.message as string
                        }
                      />
                    )}

                    {isInPerson && (
                      <GoogleMapsAutoComplete
                        defaultValue={mapAddress}
                        onChange={(address, location, timezone) => {
                          setValue('metadata.ticket.event_address', address)
                          setValue('metadata.ticket.event_location', location)
                          setValue('metadata.ticket.event_timezone', timezone)
                          setMapAddress(address)
                        }}
                      />
                    )}
                  </div>

                  {/* Date */}
                  <div className="flex flex-col gap-2">
                    <div
                      className={`grid grid-cols-1 gap-2 ${compact ? '' : 'lg:grid-cols-2'}`}
                    >
                      <Input
                        {...register('metadata.ticket.event_start_date', {
                          required: {
                            value: true,
                            message: 'Add a start date to your event',
                          },
                        })}
                        onChange={(
                          evt: React.ChangeEvent<HTMLInputElement>
                        ) => {
                          if (
                            !details.metadata?.ticket?.event_end_date ||
                            new Date(details.metadata?.ticket?.event_end_date) <
                              new Date(evt.target.value)
                          ) {
                            setValue(
                              'metadata.ticket.event_end_date',
                              evt.target.value
                            )
                            setValue(
                              'metadata.ticket.event_start_time',
                              '12:00'
                            )
                          }
                        }}
                        min={today}
                        type="date"
                        label="Start date"
                        error={
                          // @ts-expect-error Property 'event_start_date' does not exist on type 'FieldError | Merge<FieldError, FieldErrorsImpl<any>>'.
                          errors.metadata?.ticket?.event_start_date?.message ||
                          ''
                        }
                      />
                      <Input
                        {...register('metadata.ticket.event_start_time', {})}
                        type="time"
                        label="Start time"
                        error={
                          // @ts-expect-error Property 'event_start_time' does not exist on type 'FieldError | Merge<FieldError, FieldErrorsImpl<any>>'.
                          errors.metadata?.ticket?.event_start_time?.message ||
                          ''
                        }
                        onChange={(
                          evt: React.ChangeEvent<HTMLInputElement>
                        ) => {
                          if (!details.metadata?.ticket?.event_end_time) {
                            setValue(
                              'metadata.ticket.event_end_time',
                              evt.target.value
                            )
                          }
                        }}
                      />
                    </div>

                    <div
                      className={`grid grid-cols-1 gap-2 ${compact ? '' : 'lg:grid-cols-2'}`}
                    >
                      <Input
                        {...register('metadata.ticket.event_end_date', {
                          required: {
                            value: true,
                            message: 'Add a end date to your event',
                          },
                        })}
                        type="date"
                        min={minEndDate}
                        label="End date"
                        error={
                          // @ts-expect-error Property 'event_start_date' does not exist on type 'FieldError | Merge<FieldError, FieldErrorsImpl<any>>'.
                          errors.metadata?.ticket?.event_end_date?.message || ''
                        }
                      />
                      <Input
                        {...register('metadata.ticket.event_end_time', {})}
                        type="time"
                        min={minEndTime}
                        label="End time"
                        error={
                          // @ts-expect-error Property 'event_end_time' does not exist on type 'FieldError | Merge<FieldError, FieldErrorsImpl<any>>'.
                          errors.metadata?.ticket?.event_end_time?.message || ''
                        }
                      />
                    </div>

                    {!isInPerson && (
                      <Controller
                        name="metadata.ticket.event_timezone"
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
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Disclosure>

          <Disclosure label="Organizer" defaultOpen>
            <div
              className={`grid ${compact ? '' : 'md:grid-cols-2'} gap-2 justify-items-stretch`}
            >
              <Input
                {...register('metadata.emailSender', {
                  required: {
                    value: true,
                    message: 'A name is required',
                  },
                })}
                type="text"
                placeholder="Satoshi Nakamoto"
                label="Name:"
                description="Used on confirmation emails sent to attendees."
                error={errors.metadata?.emailSender?.message as string}
              />
              <Input
                label="Email address:"
                {...register('metadata.replyTo', {
                  required: {
                    value: true,
                    message: 'A name is required',
                  },
                })}
                type="email"
                autoComplete="off"
                placeholder="your@email.com"
                error={errors.metadata?.replyTo?.message as string}
                description={'Used when users respond to automated emails.'}
              />
            </div>
          </Disclosure>

          <Disclosure label="Attendee Screening" defaultOpen>
            <div className="flex ">
              <p>
                Enable this feature so guests can apply to attend your event &
                get your approval before receiving the NFT ticket.
              </p>
              <ToggleSwitch
                enabled={screeningEnabled}
                setEnabled={enableScreening}
                onChange={(enabled: boolean) => {
                  setValue('metadata.requiresApproval', enabled)
                  if (enabled) {
                    setOldMaxNumberOfKeys(
                      getValues('lock.maxNumberOfKeys') || 100
                    )
                    setValue('lock.maxNumberOfKeys', 0)
                  } else {
                    setValue('lock.maxNumberOfKeys', oldMaxNumberOfKeys)
                  }
                }}
              />
            </div>
          </Disclosure>

          {!screeningEnabled && (
            <Disclosure label="Tickets" defaultOpen>
              <div className="grid gap-4">
                <p className="">
                  <FaRegLightbulb size={18} className="inline mr-1" />
                  <i>Did you know?</i> If tickets are free, or if you enable
                  credit cards for payments, attendees do not need to have their
                  own crypto wallet to get a ticket.
                </p>

                <div className="relative flex flex-col mt-4">
                  <div className="flex items-center justify-between">
                    <label className="" htmlFor="">
                      Currency & Price:
                    </label>
                    <ToggleSwitch
                      title="Free"
                      enabled={isFree}
                      setEnabled={setIsFree}
                      onChange={(enable: boolean) => {
                        if (enable) {
                          setValue('lock.keyPrice', '0')
                          setAttendeeRefund(false)
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
                        step="any"
                        disabled={isFree}
                        {...register('lock.keyPrice', {
                          valueAsNumber: true,
                          required: !isFree,
                        })}
                      />
                    </div>
                  </div>

                  <ProtocolFee network={Number(details.network)} />

                  <div className="text-sm mt-2 flex items-center justify-between">
                    <Checkbox
                      disabled={kickbackDisabled}
                      label={`Treat the price as a deposit which will be refunded when attendees check in at the event (not applicable to credit cards). ${!kickbackSupported ? `This feature is not supported on ${currencyNetwork}.` : ''}`}
                      checked={attendeeRefund}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        setAttendeeRefund(event.target.checked)
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="" htmlFor="">
                      Capacity:
                    </label>
                    <ToggleSwitch
                      title="Unlimited"
                      enabled={isUnlimitedCapacity}
                      setEnabled={setIsUnlimitedCapacity}
                      onChange={(enabled) => {
                        if (enabled) {
                          setValue('lock.maxNumberOfKeys', undefined)
                        }
                      }}
                    />
                  </div>

                  <Input
                    {...register('lock.maxNumberOfKeys', {
                      min: 0,
                      valueAsNumber: true,
                      required: {
                        value: !isUnlimitedCapacity,
                        message: 'Capacity is required. ',
                      },
                    })}
                    disabled={isUnlimitedCapacity}
                    autoComplete="off"
                    step={1}
                    pattern="\d+"
                    type="number"
                    placeholder="Capacity"
                    description={
                      'This is the maximum number of tickets for your event. '
                    }
                    error={errors.lock?.maxNumberOfKeys?.message}
                  />
                </div>
              </div>
            </Disclosure>
          )}

          <div className="flex flex-col justify-center gap-6">
            {Object.keys(errors).length > 0 && (
              <div className="px-2 text-red-600">
                Please make sure you complete all the required fields.{' '}
              </div>
            )}
            <Button
              disabled={Object.keys(errors).length > 0}
              className="w-full"
            >
              Create your event
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
