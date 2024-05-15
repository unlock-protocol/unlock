import { Event, PaywallConfigType } from '@unlock-protocol/core'

import { useMutation, useQuery } from '@tanstack/react-query'
import {
  AddressInput,
  Button,
  Input,
  Placeholder,
  isAddressOrEns,
  minifyAddress,
} from '@unlock-protocol/ui'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuth } from '~/contexts/AuthenticationContext'
import useEns, { getAddressForName } from '~/hooks/useEns'
import { storage } from '~/config/storage'
import { onResolveName } from '~/utils/resolvers'
import { Verifier } from '@unlock-protocol/unlock-js'

export interface VerifierFormProps {
  event: Event
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

interface VerifierCardProps {
  verifier: Verifier
  onDeleteVerifier: (address: string) => Promise<any>
  isLoading?: boolean
}

interface VerifierFormDataProps {
  verifier: string
  name?: string
}

const VerifierCard = ({
  verifier,
  onDeleteVerifier,
  isLoading,
}: VerifierCardProps) => {
  const { account } = useAuth()

  const isCurrentAccount =
    account?.toLowerCase() === verifier?.address?.toLowerCase()

  const address = useEns(verifier.address)

  return (
    <div className="flex flex-col items-center justify-between px-4 py-2 border border-gray-200 rounded-lg md:flex-row">
      <div className="flex flex-col gap-2 ">
        <span className="text-base text-brand-dark">{address}</span>
        {isCurrentAccount && (
          <span className="text-sm font-semibold text-brand-ui-primary">
            {`That's you`}
          </span>
        )}
        {verifier?.name && (
          <span className="text-base text-brand-dark">
            Name: {verifier.name}
          </span>
        )}
      </div>
      <Button
        size="tiny"
        variant="outlined-primary"
        onClick={() => onDeleteVerifier(verifier.address)}
        disabled={isLoading}
      >
        Remove
      </Button>
    </div>
  )
}

export const VerifierForm = ({ event }: VerifierFormProps) => {
  const localForm = useForm<VerifierFormDataProps>()
  const { handleSubmit, control, setValue, register } = localForm

  const { verifier } = useWatch({
    control,
  })

  const addVerifier = async ({
    address,
    name,
  }: {
    address: string
    name?: string
  }) => {
    const resolvedAddress = await getAddressForName(address)

    const response = await storage.addEventVerifier(
      event.slug,
      resolvedAddress,
      {
        verifierName: name,
      }
    )

    return response.data
  }

  const addEventVerifierMutation = useMutation(addVerifier, {
    onSuccess: (res: any) => {
      if (res?.message) {
        ToastHelper.error(res?.message)
      } else {
        ToastHelper.success(`Verifier added to list`)
        setValue('verifier', '')
        setValue('name', '')
      }
      refetchList()
    },
    onError: (err: any) => {
      ToastHelper.error(
        err?.error ??
          'There was a problem adding the verifier address, please re-load and try again'
      )
    },
  })

  const deleteVerifierMutation = useMutation(
    async (address: string) => {
      storage.deleteEventVerifier(event.slug, address)
    },
    {
      onSuccess: (res: any, verifier: string) => {
        if (res?.message) {
          ToastHelper.error(res?.message)
        } else {
          ToastHelper.success(`${minifyAddress(verifier)} deleted from list`)
        }
        refetchList()
      },
    }
  )

  const {
    isLoading: isLoadingItems,
    refetch: refetchList,
    data: verifiers,
  } = useQuery(
    ['eventVerifiers', event.slug],
    async () => {
      const response = await storage.eventVerifiers(event.slug)
      return (response.data as []) || []
    },
    {
      onError: (err: any) => {
        ToastHelper.error(
          err?.error ??
            'We could not load the list of verifiers for your lock. Please reload to to try again.'
        )
      },
    }
  )

  const onAddVerifier = async ({ verifier, name }: VerifierFormDataProps) => {
    await addEventVerifierMutation.mutateAsync({ address: verifier, name })
  }

  const onDeleteVerifier = async (address: string) => {
    await deleteVerifierMutation.mutateAsync(address)
  }

  const isLoading =
    isLoadingItems ||
    addEventVerifierMutation.isLoading ||
    deleteVerifierMutation.isLoading

  const noVerifiers = verifiers?.length === 0

  return (
    <div className="relative">
      <div className="flex flex-col gap-4">
        {noVerifiers && !isLoading && (
          <span>
            This event currently does not have any verifier. You can add some
            using the form below.
          </span>
        )}
        {!noVerifiers && !isLoading && (
          <div className="grid gap-1">
            <span className="font-semibold">Verifiers</span>
            <div className="grid gap-2">
              {verifiers?.map((verifier: Verifier) => (
                <VerifierCard
                  verifier={verifier}
                  key={verifier.address}
                  onDeleteVerifier={onDeleteVerifier}
                  isLoading={deleteVerifierMutation.isLoading}
                />
              ))}
            </div>
          </div>
        )}

        {(isLoadingItems || addEventVerifierMutation.isLoading) &&
          !deleteVerifierMutation.isLoading && <Placeholder.Line size="xl" />}
      </div>
      <form
        className="flex flex-col gap-6 mt-8"
        onSubmit={handleSubmit(onAddVerifier)}
      >
        <div className="flex flex-col gap-2">
          <Input
            type="text"
            placeholder="Verifier name"
            label="Name"
            autoComplete="off"
            description="Set an optional name to easily check who verified."
            {...register('name')}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Controller
            name="verifier"
            control={control}
            rules={{
              required: true,
              validate: isAddressOrEns,
            }}
            render={() => {
              return (
                <>
                  <AddressInput
                    withIcon
                    value={verifier}
                    label="Wallet address or ENS name"
                    autoComplete="off"
                    onChange={(value: any) => {
                      setValue('verifier', value)
                    }}
                    onResolveName={onResolveName}
                  />
                </>
              )
            }}
          />
        </div>
        <Button
          type="submit"
          className="w-full md:w-1/2"
          disabled={isLoading}
          loading={addEventVerifierMutation.isLoading}
        >
          Add
        </Button>
      </form>
    </div>
  )
}
