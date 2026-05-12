import { usePlacesWidget } from 'react-google-autocomplete'
import { config } from '~/config/app'
import { useState } from 'react'
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
} from '@unlock-protocol/ui'
import { useImageUpload } from '~/hooks/useImageUpload'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { regexUrlPattern } from '~/utils/regexUrlPattern'

export interface ExternalEventForm {
  metadata: Partial<MetadataFormData> & {
    title: string
    url: string
  }
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
  onSubmit: (data: ExternalEventForm) => void
  compact?: boolean
}

export const ExternalEventForm = ({ onSubmit, compact = false }: FormProps) => {
  const [isInPerson, setIsInPerson] = useState(true)
  const { mutateAsync: uploadImage, isPending: isUploading } = useImageUpload()

  const today = dayjs().format('YYYY-MM-DD')

  const methods = useForm<ExternalEventForm>({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      metadata: {
        title: '',
        description: '',
        url: '',
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

  const ticket = details?.metadata?.ticket

  const metadataImage = watch('metadata.image')
  const isSameDay = dayjs(ticket?.event_end_date).isSame(
    ticket?.event_start_date,
    'day'
  )

  const minEndTime = isSameDay ? ticket?.event_start_time : undefined
  const minEndDate = dayjs(ticket?.event_start_date).format('YYYY-MM-DD')

  const router = useRouter()

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
    onSubmit(values)
  }

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
                  {...register('metadata.title', {
                    required: {
                      value: true,
                      message: 'Title is required',
                    },
                  })}
                  type="text"
                  placeholder="Title"
                  label="Title"
                  description="Enter the title of the event."
                  error={
                    typeof errors.metadata?.title?.message === 'string'
                      ? errors.metadata.title.message
                      : undefined
                  }
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

                <Input
                  {...register('metadata.url', {
                    pattern: {
                      value: regexUrlPattern,
                      message: 'Please enter a valid URL',
                    },
                  })}
                  type="text"
                  placeholder="https://example.com/event"
                  label="Event Link"
                  description="Enter a link to the event."
                  error={
                    typeof errors.metadata?.url?.message === 'string'
                      ? errors.metadata.url.message
                      : undefined
                  }
                />
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
                        height={compact ? '300' : '350'}
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
              Add External Event
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
