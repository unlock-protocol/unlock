'use client'

import { SettingCard } from '~/components/interface/locks/Settings/elements/SettingCard'
import { Controller, useForm } from 'react-hook-form'
import { BiLogoZoom as ZoomIcon } from 'react-icons/bi'

import {
  Event,
  PaywallConfigType,
  formDataToMetadata,
} from '@unlock-protocol/core'
import { locksmith } from '~/config/locksmith'
import {
  Button,
  ImageUpload,
  Input,
  Select,
  TextBox,
  ToggleSwitch,
} from '@unlock-protocol/ui'
import { useImageUpload } from '~/hooks/useImageUpload'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useEffect, useState } from 'react'
import { config } from '~/config/app'
import dayjs from 'dayjs'
import { GoogleMapsAutoComplete } from '../Form'
import { DefaultLayoutSkeleton } from './DefaultLayoutSkeleton'
import { BannerlessLayoutSkeleton } from './BannerlessLayoutSkeleton'
import { regexUrlPattern } from '~/utils/regexUrlPattern'

interface GeneralProps {
  event: Event
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

const today = dayjs().format('YYYY-MM-DD')

export const General = ({ event, checkoutConfig }: GeneralProps) => {
  const {
    register,
    getValues,
    setValue,
    setError,
    clearErrors,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      name: event.name,
      description: event.description,
      image: event.image,
      ticket: event.ticket,
      layout: event.layout,
    },
  })
  const [isInPerson, setIsInPerson] = useState<boolean>(
    encodeURIComponent(getValues('ticket.event_is_in_person')) === 'true'
  )
  const [mapAddress, setMapAddress] = useState(
    encodeURIComponent(getValues('ticket.event_address') || 'Ethereum')
  )

  const { mutateAsync: uploadImage, isPending: isUploading } = useImageUpload()

  const isSameDay = dayjs(event.ticket?.event_end_date).isSame(
    event.ticket?.event_start_date,
    'day'
  )
  const minEndTime = isSameDay
    ? getValues('ticket.event_start_time')
    : undefined
  const minEndDate = dayjs(getValues('ticket.event_start_date')).format(
    'YYYY-MM-DD'
  )

  useEffect(() => {
    setMapAddress(getValues('ticket.event_address'))
  }, [event.ticket?.event_address])

  const [selectedLayout, setSelectedLayout] = useState(
    getValues('layout') || 'default'
  )

  const handleSelect = (layout: any) => {
    setSelectedLayout(layout)
  }

  const save = async (values: {
    name: string
    description: string
    image: string
    layout: string
  }) => {
    await ToastHelper.promise(
      locksmith.saveEventData({
        data: formDataToMetadata({
          ...event,
          ...values,
        }),
        // @ts-expect-error
        checkoutConfig,
      }),
      {
        success: 'Event saved!',
        error:
          'We could not save your event. Please try again and report if the issue persists.',
        loading: "Updating your event's properties.",
      }
    )
  }

  return (
    <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit(save)}>
      <SettingCard
        label="Name, description, layout and image"
        description="Change the name description and image for your event!"
      >
        <div className="flex gap-4 flex-col md:flex-row">
          <div className="order-2 md:order-1">
            <Controller
              name="image"
              control={control}
              rules={{
                required: 'Image is required',
                validate: (value) => {
                  if (!value) return 'Image is required'
                  return true
                },
              }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <ImageUpload
                  description="This illustration will be used for the event page. Use 512 by 512 pixels for best results."
                  isUploading={isUploading}
                  preview={value || event.image}
                  onChange={async (fileOrFileUrl: any) => {
                    if (typeof fileOrFileUrl === 'string') {
                      onChange(fileOrFileUrl)
                    } else {
                      const items = await uploadImage(fileOrFileUrl[0])
                      const image = items?.[0]?.publicUrl
                      if (!image) return
                      onChange(image)
                    }
                  }}
                  error={error?.message}
                />
              )}
            />
          </div>
          <div className="flex flex-col order-1 gap-4 md:order-2 grow">
            <Input
              {...register('name', {
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
              error={errors.name?.message}
            />

            <TextBox
              {...register('description', {
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
              rows={getValues('description').split('\n').length + 2}
              error={errors.description?.message as string}
            />
          </div>
        </div>
        <div className="flex flex-end w-full pt-8 flex-row-reverse">
          <Button loading={isSubmitting} type="submit" className="w-48">
            Save
          </Button>
        </div>
      </SettingCard>

      <SettingCard
        label="Layout"
        description="Update the layout of your event."
      >
        <div>
          <Controller
            name="layout"
            control={control}
            render={({ field: { onChange } }) => {
              return (
                <div className="flex flex-col sm:flex-row justify-around gap-8 mx-4 sm:mx-8 my-4 h-auto sm:h-64">
                  <DefaultLayoutSkeleton
                    selectedLayout={selectedLayout}
                    handleSelect={() => {
                      onChange('default')
                      handleSelect('default')
                    }}
                  />
                  <BannerlessLayoutSkeleton
                    selectedLayout={selectedLayout}
                    handleSelect={() => {
                      onChange('bannerless')
                      handleSelect('bannerless')
                    }}
                  />
                </div>
              )
            }}
          />
        </div>
        <div className="flex flex-col sm:flex-row-reverse w-full pt-8">
          <Button
            loading={isSubmitting}
            type="submit"
            className="w-full sm:w-48"
          >
            Save
          </Button>
        </div>
      </SettingCard>

      <SettingCard
        label="Date, time and location"
        description="Update the date, time and location of your event."
      >
        <div className="grid">
          <p className="mb-5">
            This information will be public and included on each of the NFT
            tickets.
          </p>
          <div className="grid items-center gap-4 align-top sm:grid-cols-2">
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
            <div className="flex flex-col self-start gap-2 justify-top">
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                <Input
                  {...register('ticket.event_start_date', {
                    required: {
                      value: true,
                      message: 'Add a start date to your event',
                    },
                  })}
                  onChange={(evt) => {
                    if (
                      !event?.ticket?.event_end_date ||
                      new Date(event?.ticket?.event_end_date) <
                        new Date(evt.target.value)
                    ) {
                      setValue('ticket.event_end_date', evt.target.value)
                      setValue('ticket.event_start_time', '12:00')
                    }
                  }}
                  min={today}
                  type="date"
                  label="Start date"
                  error={errors.ticket?.event_start_date?.message || ''}
                />
                <Input
                  {...register('ticket.event_start_time', {})}
                  type="time"
                  label="Start time"
                  error={errors.ticket?.event_start_time?.message || ''}
                  onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                    if (!event?.ticket?.event_end_time) {
                      setValue('ticket.event_end_time', evt.target.value)
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                <Input
                  {...register('ticket.event_end_date', {
                    required: {
                      value: true,
                      message: 'Add a end date to your event',
                    },
                  })}
                  type="date"
                  min={minEndDate}
                  label="End date"
                  error={errors.ticket?.event_end_date?.message || ''}
                />
                <Input
                  {...register('ticket.event_end_time', {})}
                  type="time"
                  min={minEndTime}
                  label="End time"
                  error={errors.ticket?.event_end_time?.message || ''}
                />
              </div>

              <Controller
                name="ticket.event_timezone"
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <Select
                      onChange={(newValue: any) => {
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

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <label className="px-1 mb-2 text-base" htmlFor="">
                    Location
                  </label>
                  <ToggleSwitch
                    title="In person"
                    enabled={isInPerson}
                    setEnabled={setIsInPerson}
                    onChange={(enabled) => {
                      setValue('ticket.event_is_in_person', enabled)
                      setValue('ticket.event_address', '')
                      setValue('ticket.event_location', '')

                      if (!enabled) {
                        setError('ticket.event_address', {
                          type: 'manual',
                          message: 'Please enter a valid URL',
                        })
                      } else {
                        clearErrors('ticket.event_address')
                      }
                    }}
                  />
                </div>

                {!isInPerson && (
                  <Input
                    {...register('ticket.event_address')}
                    type="text"
                    defaultValue={event?.ticket?.event_address}
                    placeholder={'Zoom or Google Meet Link'}
                    onChange={(event) => {
                      if (!regexUrlPattern.test(event.target.value)) {
                        setError('ticket.event_address', {
                          type: 'manual',
                          message: 'Please enter a valid URL',
                        })
                      } else {
                        clearErrors('ticket.event_address')
                      }
                    }}
                    error={errors.ticket?.event_address?.message as string}
                  />
                )}

                {isInPerson && (
                  <GoogleMapsAutoComplete
                    defaultValue={event.ticket.event_location}
                    onChange={(address, location, timezone) => {
                      setValue('ticket.event_address', address)
                      setValue('ticket.event_location', location)
                      setValue('ticket.event_timezone', timezone)
                      setMapAddress(getValues('ticket.event_address'))
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-end w-full pt-8 flex-row-reverse">
          <Button
            loading={isSubmitting}
            disabled={Object.keys(errors).length > 0}
            type="submit"
            className="w-48"
          >
            Save
          </Button>
        </div>
      </SettingCard>
    </form>
  )
}
