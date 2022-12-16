import { Button } from '@unlock-protocol/ui'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { AdvancedForm } from './AdvancedForm'
import { LockCustomForm } from './custom'
import { DetailForm } from './DetailForm'
import { TicketForm } from './TicketForm'
import {
  formDataToMetadata,
  Metadata,
  MetadataFormData,
  toFormData,
} from './utils'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { useUpdateMetadata, useMetadata } from '~/hooks/metadata'
import LoadingIcon from '../../Loading'

interface Props {
  name?: string
  lockAddress: string
  network: number
  keyId?: string
}

export function UpdateMetadataForm({
  lockAddress,
  network,
  name,
  keyId,
}: Props) {
  const { data: metadata, isInitialLoading: isMetadataLoading } = useMetadata({
    lockAddress,
    network,
    keyId,
  })

  const methods = useForm<MetadataFormData>({
    defaultValues: {
      name,
    },
    mode: 'onChange',
  })

  const { mutateAsync: updateMetadata, isLoading: isMetadataUpating } =
    useUpdateMetadata({
      lockAddress,
      network,
      keyId,
    })

  const onSubmit = async (formData: MetadataFormData) => {
    const metadata = formDataToMetadata(formData)
    await updateMetadata(metadata)
  }

  useEffect(() => {
    if (metadata && !isMetadataLoading) {
      const form = toFormData(metadata as Metadata)
      methods.reset(form)
    }
  }, [metadata, methods])

  if (isMetadataLoading) {
    return <LoadingIcon />
  }

  return (
    <div className="max-w-screen-md mx-auto">
      <div className="pt-2 pb-6 space-y-2">
        <h1 className="text-xl font-bold sm:text-3xl">Edit Properties</h1>
        <div>
          <p className="text-lg text-gray-700">
            Add rich properties and data to your NFT memberships.
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
      </div>
      <FormProvider {...methods}>
        <form className="mb-6" onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="grid gap-6">
            <DetailForm disabled={isMetadataUpating} />
            <TicketForm
              lockAddress={lockAddress}
              network={network}
              disabled={isMetadataUpating}
            />
            <AdvancedForm disabled={isMetadataUpating} />
            <LockCustomForm />
            <div className="flex justify-center">
              <Button
                disabled={isMetadataUpating}
                loading={isMetadataUpating}
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
