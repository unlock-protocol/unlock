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
import { Attribute, Metadata, MetadataFormData, toFormData } from './utils'
import { config } from '~/config/app'

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
      onError(error) {
        console.error(error)
      },
      refetchInterval: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 2,
    }
  )

  const methods = useForm<MetadataFormData>({
    defaultValues: {
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
    description,
    animation_url,
    youtube_url,
    external_url,
    background_color,
    ticket,
    properties,
    levels,
    stats,
  }: MetadataFormData) => {
    const metadata = {
      name,
      image: `${config.locksmithHost}/lock/${lockAddress}/icon`,
      description,
      animation_url,
      youtube_url,
      external_url,
      background_color,
      attributes: [] as Attribute[],
    }

    for (const [key, value] of Object.entries(ticket || {})) {
      if (!value) {
        continue
      }
      metadata.attributes.push({
        trait_type: key,
        value,
      })
    }

    const propertyAttributes = properties?.filter(
      (item) => item.trait_type && item.value
    )

    const levelsAttributes = levels?.filter(
      (item) => item.trait_type && item.value && item.max_value
    )
    const statsAttributes = stats?.filter(
      (item) => item.trait_type && item.value && item.max_value
    )

    if (propertyAttributes?.length) {
      metadata.attributes.push(...propertyAttributes)
    }

    if (levelsAttributes?.length) {
      metadata.attributes.push(...levelsAttributes)
    }

    if (statsAttributes?.length) {
      metadata.attributes.push(...statsAttributes)
    }

    await lockMetadata.mutateAsync(metadata)
  }

  useEffect(() => {
    if (data) {
      const form = toFormData(data as Metadata)
      methods.reset(form)
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
