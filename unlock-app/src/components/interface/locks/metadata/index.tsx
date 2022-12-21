import { Button, Input } from '@unlock-protocol/ui'
import { useEffect, useMemo, useState } from 'react'
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
import { config } from '~/config/app'
import { useAuth } from '~/contexts/AuthenticationContext'
import { Picker, PickerState } from '../../Picker'

interface Props {
  lockAddress?: string
  network?: number
  keyId?: string
}

interface FormProps {
  lockAddress: string
  network: number
  keyId?: string
  defaultValues: MetadataFormData
}

export const Form = ({
  lockAddress,
  network,
  keyId,
  defaultValues,
}: FormProps) => {
  const methods = useForm<MetadataFormData>({
    mode: 'onSubmit',
  })

  const image = `${config.locksmithHost}/lock/${lockAddress}/icon${
    keyId ? `?id=${keyId}` : ''
  }`

  useEffect(() => {
    methods.reset()
    methods.reset({
      ...defaultValues,
      image: defaultValues.image || image,
    })
  }, [defaultValues, methods, image])

  const { mutateAsync: updateMetadata, isLoading: isMetadataUpating } =
    useUpdateMetadata({
      lockAddress,
      network,
      keyId,
    })

  const onSubmit = async (formData: MetadataFormData) => {
    const metadata = formDataToMetadata({
      // Handle ID in image URL
      image: formData.image || image,
      ...formData,
    })
    await updateMetadata(metadata)
  }

  return (
    <FormProvider {...methods}>
      <form className="mb-6" onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          <DetailForm />
          <TicketForm
            lockAddress={lockAddress}
            network={network}
            disabled={isMetadataUpating}
          />
          <AdvancedForm />
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
  )
}

export function UpdateMetadataForm({ lockAddress, network, keyId }: Props) {
  const { account } = useAuth()
  const [selected, setSelected] = useState<PickerState>({
    lockAddress,
    network,
    keyId,
  })

  const { data: metadata, isInitialLoading: isMetadataLoading } = useMetadata({
    lockAddress: selected.lockAddress,
    network: selected.network,
    keyId: selected.keyId,
  })

  const defaultValues = useMemo(() => {
    return toFormData((metadata || {}) as Metadata)
  }, [metadata])

  return (
    <div className="grid max-w-3xl gap-6 pb-24 mx-auto">
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
      <div className="grid gap-6 p-6 border border-ui-secondary-600 bg-ui-secondary-400 rounded-xl">
        <div className="space-y-1">
          <h3 className="text-lg font-bold">NFT Selection</h3>
          <p className="text-gray-600">
            Select the Lock or Key you want to edit properties for.
          </p>
        </div>
        <Picker
          userAddress={account!}
          lockAddress={lockAddress}
          network={network}
          keyId={keyId}
          collect={{
            keyId: true,
            lockAddress: true,
            network: true,
          }}
          onChange={(selected) => {
            setSelected(selected)
          }}
        />
      </div>
      {isMetadataLoading && <LoadingIcon />}
      {!isMetadataLoading && selected.lockAddress && selected.network && (
        <Form
          lockAddress={selected.lockAddress}
          network={selected.network}
          keyId={selected.keyId}
          defaultValues={defaultValues}
        />
      )}
    </div>
  )
}
