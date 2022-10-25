import { useQuery, useMutation } from '@tanstack/react-query'
import { Button } from '@unlock-protocol/ui'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useStorageService } from '~/utils/withStorageService'
import { LockAdvancedForm } from './LockAdvancedForm'
import { LockCustomForm } from './custom'
import { LockDetailForm } from './LockDetailForm'
import { LockTicketForm } from './LockTicketForm'
import { Attribute, MetadataFormData } from './utils'

export function UpdateLockMetadata() {
  const router = useRouter()
  const lockAddress = router.query.address!.toString()
  const network = Number(router.query.network)
  const storageService = useStorageService()

  const { data } = useQuery<Record<string, any>>(
    ['lockMetadata', lockAddress, network],
    async () => {
      const response = await storageService.locksmith.lockMetadata(
        network,
        lockAddress
      )
      return response.data
    },
    {
      initialData: {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onError() {},
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: false,
    }
  )

  const methods = useForm<MetadataFormData>({
    defaultValues: data || {
      name: 'Locksmith 101',
      external_url: 'https://example.com',
    },
  })

  const lockMetadata = useMutation(
    async (metadata: Record<string, any>) => {
      const token = await storageService.getAccessToken()
      const result = await storageService.locksmith.updateLockMetadata(
        network,
        lockAddress,
        {
          metadata,
        },
        {
          headers: storageService.genAuthorizationHeader(token),
        }
      )
      return result.data
    },
    {
      mutationKey: ['lockMetadata', lockAddress, network],
      onError(error) {
        ToastHelper.error(error as any)
      },
      onSuccess() {
        ToastHelper.success('Metadata successfully saved!')
      },
    }
  )

  const onSubmit = async ({
    name,
    animation_url,
    youtube_url,
    external_url,
    background_color,
    ticket,
    properties,
  }: MetadataFormData) => {
    const metadata = {
      name,
      animation_url,
      youtube_url,
      external_url,
      background_color,
      properties,
      ticket,
      attributes: [] as Attribute[],
    }

    if (ticket.event_address) {
      metadata.attributes.push({
        trait_type: 'event_address',
        value: ticket.event_address,
      })
    }

    if (ticket.event_meeting_url) {
      metadata.attributes.push({
        trait_type: 'event_meeting_url',
        value: ticket.event_meeting_url,
      })
    }

    if (ticket.event_date) {
      metadata.attributes.push({
        trait_type: 'event_date',
        value: ticket.event_date,
      })
    }

    if (ticket.event_time) {
      metadata.attributes.push({
        trait_type: 'event_time',
        value: ticket.event_time,
      })
    }

    const propertyAttributes = properties.filter(
      (item) => item.trait_type && item.value
    )

    metadata.attributes.push(...propertyAttributes)

    await lockMetadata.mutateAsync(metadata)
  }

  useEffect(() => {
    if (Object.keys(data).length) {
      methods.reset(data)
    }
  }, [data, methods])

  return (
    <div className="max-w-screen-md mx-auto">
      <header className="pt-2 pb-6 space-y-2">
        <h1 className="text-xl font-bold sm:text-3xl">Update Metadata</h1>
        <p className="text-lg text-gray-700">
          Adding the rich data to your membership
        </p>
      </header>
      <FormProvider {...methods}>
        <form className="mb-6" onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="grid gap-6">
            <LockDetailForm disabled={lockMetadata.isLoading} />
            <LockTicketForm disabled={lockMetadata.isLoading} />
            <LockAdvancedForm disabled={lockMetadata.isLoading} />
            <LockCustomForm />
            <div className="flex justify-center">
              <Button
                disabled={lockMetadata.isLoading}
                loading={lockMetadata.isLoading}
                className="w-full max-w-sm"
              >
                Update
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
