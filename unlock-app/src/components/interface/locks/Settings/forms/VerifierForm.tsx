import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Input } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuth } from '~/contexts/AuthenticationContext'
import { getAddressForName } from '~/hooks/useEns'
import { useState } from 'react'
import { addressMinify } from '~/utils/strings'
import { storage } from '~/config/storage'

interface VerifierProps {
  address: string
  createdAt: string
  updatedAt: string
  lockAddress: string
  lockManager: string
  network: number
  id: number
}

interface VerifierFormProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
}

interface VerifierCardProps {
  verifier: VerifierProps
  onDeleteVerifier: (address: string) => Promise<any>
  isLoading?: boolean
  disabled: boolean
}

interface VerifierFormDataProps {
  verifier: string
}

const VerifierCardPlaceholder = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="border border-gray-200 rounded-lg bg-slate-200 animate-pulse h-14"></div>
    </div>
  )
}

const VerifierCard = ({
  verifier,
  onDeleteVerifier,
  isLoading,
  disabled,
}: VerifierCardProps) => {
  const { account } = useAuth()

  const isCurrentAccount =
    account?.toLowerCase() === verifier?.address?.toLowerCase()

  const address = verifier.address

  return (
    <div className="flex flex-col items-center justify-between px-4 py-2 border border-gray-200 rounded-lg md:flex-row">
      <div className="flex flex-col gap-2 ">
        <span className="text-base text-brand-dark">{address}</span>
        {isCurrentAccount && (
          <span className="text-sm font-semibold text-brand-ui-primary">
            {`That's you`}
          </span>
        )}
      </div>
      <Button
        size="small"
        variant="outlined-primary"
        onClick={() => onDeleteVerifier(address)}
        disabled={isLoading || disabled}
      >
        Remove
      </Button>
    </div>
  )
}

export const VerifierForm = ({
  lockAddress,
  network,
  isManager,
  disabled,
}: VerifierFormProps) => {
  const [verifiers, setVerifiers] = useState<VerifierProps[]>([])

  const { register, handleSubmit, reset } = useForm<VerifierFormDataProps>({
    defaultValues: {
      verifier: '',
    },
  })

  const getVerifiers = async () => {
    const response = await storage.verifiers(network, lockAddress)
    return response.data.results || []
  }

  const addVerifier = async (address: string) => {
    const resolvedAddress = await getAddressForName(address)
    const response = await storage.createVerifier(
      network,
      lockAddress,
      resolvedAddress
    )
    return response.data
  }

  const deleteVerifier = async (address: string) => {
    const response = await storage.deleteVerifier(network, lockAddress, address)
    return response.data.results
  }

  const addVerifierMutation = useMutation(addVerifier, {
    onSuccess: (res: any) => {
      if (res?.message) {
        ToastHelper.error(res?.message)
      } else {
        ToastHelper.success(`Verifier added to list`)
        reset()
      }
    },
    onError: (err: any) => {
      ToastHelper.error(
        err?.error ??
          'There was a problem adding the verifier address, please re-load and try again'
      )
    },
  })

  const deleteVerifierMutation = useMutation(deleteVerifier, {
    onSuccess: (res: any, verifier: string) => {
      if (res?.message) {
        ToastHelper.error(res?.message)
      } else {
        ToastHelper.success(`${addressMinify(verifier)} deleted from list`)
      }
    },
  })

  const { isLoading: isLoadingItems } = useQuery(
    [
      'getVerifiers',
      lockAddress,
      network,
      addVerifierMutation.isSuccess,
      deleteVerifierMutation.isSuccess,
    ],
    async () => await getVerifiers(),
    {
      enabled: isManager,
      refetchInterval: false,
      onSuccess: (verifiers: VerifierProps[]) => {
        setVerifiers(verifiers)
      },
      onError: (err: any) => {
        ToastHelper.error(
          err?.error ??
            'We could not load the list of verifiers for your lock. Please reload to to try again.'
        )
      },
    }
  )

  const onAddVerifier = async ({ verifier }: VerifierFormDataProps) => {
    await addVerifierMutation.mutateAsync(verifier)
  }

  const onDeleteVerifier = async (address: string) => {
    await deleteVerifierMutation.mutateAsync(address)
  }

  const isLoading =
    isLoadingItems ||
    addVerifierMutation.isLoading ||
    deleteVerifierMutation.isLoading

  const noVerifiers = verifiers?.length === 0

  return (
    <div className="relative">
      <div className="flex flex-col gap-4">
        {noVerifiers && !isLoading && (
          <span>
            {isManager
              ? 'This lock currently does not have any verifier.'
              : 'Only lock manager can access verifiers list.'}
          </span>
        )}
        {(verifiers ?? [])?.map((verifier: VerifierProps) => (
          <VerifierCard
            verifier={verifier}
            key={verifier.id}
            onDeleteVerifier={onDeleteVerifier}
            isLoading={deleteVerifierMutation.isLoading}
            disabled={disabled}
          />
        ))}
        {(isLoadingItems || addVerifierMutation.isLoading) &&
          !deleteVerifierMutation.isLoading && <VerifierCardPlaceholder />}
      </div>
      {isManager && (
        <form
          className="flex flex-col gap-6 mt-8"
          onSubmit={handleSubmit(onAddVerifier)}
        >
          <div className="flex flex-col gap-2">
            <span className="text-base text-brand-dark">
              Add verifier, please enter the wallet address of theirs.
            </span>
            <Input
              disabled={disabled}
              {...register('verifier')}
              autoComplete="off"
            />
          </div>
          <Button
            type="submit"
            className="w-full md:w-1/2"
            disabled={isLoading || disabled}
            loading={addVerifierMutation.isLoading}
          >
            Add
          </Button>
        </form>
      )}
    </div>
  )
}
