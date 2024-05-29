import { SettingCard } from '~/components/interface/locks/Settings/elements/SettingCard'
import { Controller, useForm } from 'react-hook-form'
import { BiLogoZoom as ZoomIcon } from 'react-icons/bi'

import {
  Event,
  PaywallConfigType,
  formDataToMetadata,
} from '@unlock-protocol/core'
import { storage } from '~/config/storage'
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
import { useState } from 'react'
import { config } from '~/config/app'
import dayjs from 'dayjs'
import { GoogleMapsAutoComplete } from '../Form'

interface GeneralProps {
  event: Event
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

const today = dayjs().format('YYYY-MM-DD')

export const General = ({ event, checkoutConfig }: GeneralProps) => {
  const [isInPerson, setIsInPerson] = useState(true)
  const {
    register,
    getValues,
    setValue,
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
    },
  })
  const [mapAddress, setMapAddress] = useState(
    encodeURIComponent(getValues('ticket.event_address') || 'Ethereum')
  )

  const { mutateAsync: uploadImage, isLoading: isUploading } = useImageUpload()

  const isSameDay = dayjs(event.ticket?.event_end_date).isSame(
    event.ticket?.event_start_date,
    'day'
  )
  const minEndTime = isSameDay ? event.ticket?.event_start_time : undefined
  const minEndDate = dayjs(event.ticket?.event_start_date).format('YYYY-MM-DD')

  const save = async (values: {
    name: string
    description: string
    image: string
  }) => {
    await ToastHelper.promise(
      storage.saveEventData({
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
        loading: `Updating your event's properties.`,
      }
    )
  }

  return (
    <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit(save)}>
      <SettingCard
        label="Name, description, and image"
        description="Change the name description and image for your event!"
      >
        <div className="flex gap-4 flex-col md:flex-row">
          <div className="order-2 md:order-1">
            <ImageUpload
              description="This illustration will be used for the event page. Use 512 by 512 pixels for best results."
              isUploading={isUploading}
              preview={getValues('image') || event.image}
              onChange={async (fileOrFileUrl: any) => {
                if (typeof fileOrFileUrl === 'string') {
                  setValue('image', fileOrFileUrl)
                } else {
                  const items = await uploadImage(fileOrFileUrl[0])
                  const image = items?.[0]?.publicUrl
                  if (!image) {
                    return
                  }
                  setValue('image', image)
                }
              }}
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
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
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

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
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
                    onChange={() => {
                      setValue('ticket.event_address', '')
                    }}
                  />
                </div>

                {!isInPerson && (
                  <Input
                    {...register('ticket.event_address')}
                    type="text"
                    defaultValue={event?.ticket?.event_address}
                    placeholder={'Zoom or Google Meet Link'}
                  />
                )}

                {isInPerson && (
                  <Controller
                    name="ticket.event_address"
                    control={control}
                    render={({ field: { onChange } }) => {
                      setMapAddress(getValues('ticket.event_address'))
                      return (
                        <GoogleMapsAutoComplete
                          defaultValue={event.ticket.event_address}
                          onChange={onChange}
                        />
                      )
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-end w-full pt-8 flex-row-reverse">
          <Button loading={isSubmitting} type="submit" className="w-48">
            Save
          </Button>
        </div>
      </SettingCard>
    </form>
  )
}
