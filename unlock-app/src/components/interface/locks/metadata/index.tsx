import { Button } from '@unlock-protocol/ui'
import { ReactNode, useEffect, useMemo, useState } from 'react'
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
import { useMutation, useQuery } from '@tanstack/react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useWalletService } from '~/utils/withWalletService'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { RiErrorWarningFill as ErrorIcon } from 'react-icons/ri'

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
    mode: 'onChange',
    shouldUnregister: false,
  })

  const {
    formState: { errors },
  } = methods

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

  const errorFields = Object.keys(errors)
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
          <div className="flex flex-col justify-center gap-6">
            {errorFields.length > 0 && (
              <div className="px-2 text-red-600">
                You need fix the issues in the following fields before saving
                metadata: {errorFields.join(',')}
              </div>
            )}
            <Button
              disabled={isMetadataUpating || errorFields.length > 0}
              loading={isMetadataUpating}
              className="w-full"
            >
              Save Properties
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

interface SwitchNetworkProps {
  network: number
  children: ReactNode
}

export const SwitchNetwork = ({
  network = 1,
  children,
}: SwitchNetworkProps) => {
  const { network: connectedNetwork, changeNetwork } = useAuth()
  const [isNetworkSwitching, setIsNetworkSwitching] = useState(false)

  const isIncorrectNetwork = network !== connectedNetwork

  if (!isIncorrectNetwork) {
    return <>{children}</>
  }
  const connectedNetworkName = config.networks?.[connectedNetwork!]?.name
  const networkName = config.networks?.[network]?.name

  return (
    <div className="grid gap-6 p-6 border border-ui-secondary-600 rounded-xl">
      <div className="space-y-1">
        <h3 className="text-xl font-bold">
          You are connected to the wrong network
        </h3>
        <p className="text-gray-600">
          You are connected to the {connectedNetworkName} network. Please switch
          to the {networkName} network to change token URI.
        </p>
      </div>
      <Button
        loading={isNetworkSwitching}
        disabled={isNetworkSwitching}
        onClick={async (event) => {
          event.preventDefault()
          setIsNetworkSwitching(true)
          await changeNetwork(network)
          setIsNetworkSwitching(false)
        }}
      >
        Switch network to {networkName}
      </Button>
    </div>
  )
}

export function UpdateMetadataForm({ lockAddress, network, keyId }: Props) {
  const { account } = useAuth()
  const web3Service = useWeb3Service()
  const walletService = useWalletService()

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

  console.log('______')
  console.log(selected)
  console.log(metadata)

  const defaultValues = useMemo(() => {
    return toFormData((metadata || {}) as Metadata)
  }, [metadata])

  const baseTokenURI = `${config.locksmithHost}/api/key/${selected.network}/${selected.lockAddress}/`

  const {
    data: tokenURI,
    isInitialLoading: isTokenURILoading,
    refetch,
  } = useQuery(
    ['baseTokenURI', selected.network, selected.lockAddress],
    async () => {
      const tokenURI = await web3Service.getBaseTokenURI({
        network: selected.network!,
        lockAddress: selected.lockAddress!,
      })
      return tokenURI
    },
    {
      enabled: !!(selected.network && selected.lockAddress),
    }
  )

  const { mutateAsync: update, isLoading: isUpdatingBaseTokenURI } =
    useMutation({
      mutationKey: [
        'updateBaseTokenURI',
        selected.network,
        selected.lockAddress,
      ],
      mutationFn: async (baseTokenURI: string) => {
        await walletService.setBaseTokenURI({
          lockAddress: selected.lockAddress!,
          baseTokenURI,
        })
      },
      onError(error) {
        console.error(error)
        ToastHelper.error('Failed to update base token URI. Retry again.')
      },
      onSuccess() {
        ToastHelper.success('Base token URI updated successfully.')
        refetch()
      },
    })

  const isLoading = isMetadataLoading || isTokenURILoading

  const isLockSelected = selected.lockAddress && selected.network

  const isTokenURIEditable = useMemo(() => {
    return true
    if (!tokenURI || isTokenURILoading) {
      return false
    }
    try {
      const tokenURL = new URL(tokenURI!)
      const locksmithURL = new URL(config.locksmithHost)
      return tokenURL.hostname === locksmithURL.hostname
    } catch (error) {
      console.log(error)
      return false
    }
  }, [tokenURI, isTokenURILoading])

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
          <h3 className="text-lg font-bold">Metadata</h3>
          <p className="text-gray-600">
            Select the Lock or Key you want to edit properties for. If you save
            metadata for lock only, it will be used for all keys which do not
            have any metadata set.
          </p>
        </div>
        <Picker
          userAddress={account!}
          lockAddress={lockAddress}
          network={network}
          keyId={keyId}
          collect={{
            lockAddress: true,
            network: true,
            key: true,
          }}
          onChange={(selected) => {
            setSelected(selected)
          }}
        />
      </div>
      {isLoading && <LoadingIcon />}
      {!isLoading && !isTokenURIEditable && isLockSelected && (
        <SwitchNetwork network={selected.network!}>
          <div className="grid gap-6 p-6 border border-red-300 bg-red-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="hidden p-2 bg-red-200 rounded-full sm:block">
                <ErrorIcon size={24} className="fill-red-900" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-red-900">
                  Unexpected Base Token URI
                </h3>
                <p className="text-gray-600">
                  You need to change your base token URI to be editable by the
                  Unlock Dashboard.
                </p>
              </div>
            </div>
            <Button
              disabled={isUpdatingBaseTokenURI}
              loading={isUpdatingBaseTokenURI}
              onClick={async (event) => {
                event.preventDefault()
                await update(baseTokenURI)
              }}
            >
              Change Base Token URI
            </Button>
          </div>
        </SwitchNetwork>
      )}
      {!isLoading && isTokenURIEditable && isLockSelected && (
        <Form
          lockAddress={selected.lockAddress!}
          network={selected.network!}
          keyId={selected.keyId}
          defaultValues={defaultValues}
        />
      )}
    </div>
  )
}
