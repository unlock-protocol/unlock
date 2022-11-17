import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Input } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuth } from '~/contexts/AuthenticationContext'
import { getAddressForName } from '~/hooks/useEns'
import { useStorageService } from '~/utils/withStorageService'
import { useWalletService } from '~/utils/withWalletService'
import { useState } from 'react'
import { addressMinify } from '~/utils/strings'

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
  network: string
  isManager: boolean
  disabled: boolean
}

interface VerifierCardProps {
  verifier: VerifierProps
  onDeleteVerifier: (address: string) => Promise<any>
  isLoading?: boolean
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
}: VerifierCardProps) => {
  const { account } = useAuth()

  const isCurrentAccount =
    account?.toLowerCase() === verifier?.address?.toLowerCase()

  const address = verifier.address

  return (
    <div className="flex flex-col items-center justify-between px-4 py-2 border border-gray-200 rounded-lg md:flex-row">
      <div className="flex flex-col gap-2 ">
        <span className="text-base text-brand-dark">
          {addressMinify(address)}
        </span>
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
        disabled={isLoading}
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
  const { account } = useAuth()
  const storageService = useStorageService()
  const walletService = useWalletService()

  const { register, handleSubmit, reset } = useForm<VerifierFormDataProps>({
    defaultValues: {
      verifier: '',
    },
  })

  const getVerifiers = async () => {
    await storageService.loginPrompt({
      walletService,
      address: account!,
      chainId: parseInt(network, 10)!,
    })

    const options = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }
    return await storageService.getEndpoint(
      `/v2/api/verifier/list/${network}/${lockAddress}`,
      options,
      true /* withAuth */
    )
  }

  const addVerifier = async (address: string) => {
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    }
    const resolvedAddress = await getAddressForName(address)
    const res = await storageService.getEndpoint(
      `/v2/api/verifier/${network}/${lockAddress}/${resolvedAddress}`,
      options,
      true /* withAuth */
    )
    return res
  }

  const deleteVerifier = async (address: string) => {
    const options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }
    const res = await storageService.getEndpoint(
      `/v2/api/verifier/${network}/${lockAddress}/${address}`,
      options,
      true /* withAuth */
    )
    return res
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
      refetchInterval: false,
      onSuccess: (res: any) => {
        if (res.message) {
          ToastHelper.error(res.message)
        }
        const verifiers = res?.results ?? []
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
          <span>This lock does not have any verifier.</span>
        )}
        {(verifiers ?? [])?.map((verifier: VerifierProps) => (
          <VerifierCard
            verifier={verifier}
            key={verifier.id}
            onDeleteVerifier={onDeleteVerifier}
            isLoading={deleteVerifierMutation.isLoading}
          />
        ))}
        {(isLoadingItems || addVerifierMutation.isLoading) &&
          !deleteVerifierMutation.isLoading && <VerifierCardPlaceholder />}
      </div>
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
        {isManager && (
          <Button
            type="submit"
            className="w-1/2 gap-2"
            disabled={isLoading}
            loading={addVerifierMutation.isLoading}
          >
            Add
          </Button>
        )}
      </form>
    </div>
  )
}
