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
import { Lock } from '~/unlockTypes'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'

interface Props {
  lock?: Lock
}

export function UpdateLockMetadata({ lock }: Props) {
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
      name: lock?.name,
    },
    mode: 'onChange',
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
        console.error(error)
        ToastHelper.error('Could not update the lock data')
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
    const metadata: Metadata & { attributes: Attribute[] } = {
      name,
      image: `${config.locksmithHost}/lock/${lockAddress}/icon`,
      description,
      attributes: [] as Attribute[],
    }

    if (ticket?.event_start_date) {
      metadata.attributes.push({
        trait_type: 'event_start_date',
        value: ticket.event_start_date,
        display_type: 'date',
      })
    }

    if (ticket?.event_start_time) {
      metadata.attributes.push({
        trait_type: 'event_start_time',
        value: ticket.event_start_time,
        display_type: 'date',
      })
    }

    if (ticket?.event_address) {
      metadata.attributes.push({
        trait_type: 'event_address',
        value: ticket.event_address,
      })
    }

    if (ticket?.event_url) {
      metadata.attributes.push({
        trait_type: 'event_url',
        value: ticket.event_url,
      })
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

    // Opensea does not handle # in the color. We remove it if it's included in the color.
    if (background_color) {
      metadata.background_color = background_color?.trim()?.replace('#', '')
    }

    if (youtube_url) {
      metadata.youtube_url = youtube_url
    }

    if (animation_url) {
      metadata.animation_url = animation_url
    }

    if (external_url) {
      metadata.external_url = external_url
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
        <h1 className="text-xl font-bold sm:text-3xl">Edit Properties</h1>
        <div>
          <p className="text-lg text-gray-700">
            Add rich properties and data to your NFT memberships.{' '}
          </p>
          <a
            href="https://docs.opensea.io/docs/metadata-standards"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-brand-ui-primary hover:underline"
          >
            Learn about the OpenSea metadata.
            <ExternalLinkIcon />
          </a>
        </div>
      </header>
      <FormProvider {...methods}>
        <form className="mb-6" onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="grid gap-6">
            <LockDetailForm disabled={lockMetadata.isLoading} />
            <LockTicketForm
              lockAddress={lockAddress}
              network={network}
              disabled={lockMetadata.isLoading}
            />
            <LockAdvancedForm disabled={lockMetadata.isLoading} />
            <LockCustomForm />
            <div className="flex justify-center">
              <Button
                disabled={lockMetadata.isLoading}
                loading={lockMetadata.isLoading}
                className="w-full max-w-sm"
              >
                Save Properties
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
