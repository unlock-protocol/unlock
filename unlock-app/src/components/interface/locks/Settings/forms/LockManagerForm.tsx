import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Button,
  Input,
  AddressInput,
  isAddressOrEns,
  minifyAddress,
  Placeholder,
  Modal,
} from '@unlock-protocol/ui'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useEffect, useState } from 'react'
import { onResolveName } from '~/utils/resolvers'
import useEns from '~/hooks/useEns'
import { useAddLockManager } from '~/hooks/useAddLockManager'
import { useProvider } from '~/hooks/useProvider'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { graphService } from '~/config/subgraph'

interface LockManagerFormProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
}

interface LockManagerCardProps {
  lockAddress: string
  manager: string
  hasMultipleManagers: boolean
  network: number
}

interface RenounceModalFormProps {
  confirm: string
}

interface RenounceModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onConfirm: () => Promise<any>
}
const RenounceModal = ({
  isOpen,
  setIsOpen,
  onConfirm,
}: RenounceModalProps) => {
  const [confirmMatch, setConfirmMatch] = useState(false)
  const { register, handleSubmit, watch } = useForm<RenounceModalFormProps>({
    mode: 'all',
    defaultValues: {
      confirm: '',
    },
  })

  useEffect(() => {
    const subscription = watch((value) =>
      setConfirmMatch(value.confirm?.toLowerCase() === 'renounce')
    )
    return () => subscription.unsubscribe()
  }, [watch])

  const onRenounce = async () => {
    if (!confirmMatch) return
    await onConfirm()
    setIsOpen(false)
  }

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <form
        onSubmit={handleSubmit(onRenounce)}
        className="flex flex-col gap-6 text-center"
      >
        <div className="overflow-hidden bg-center rounded-lg">
          <img
            className="object-cover h-40"
            src="/images/illustrations/img-error.svg"
            alt="img error"
          />
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="text-4xl font-bold text-brand-dark">
            Hold Your Horses
          </h3>
          <span className="text-base text-brand-dark">
            You are about to permanently renounce yourself as Lock manager. You
            will not be able to revert this action. Please type
            &ldquo;renounce&rdquo; to confirm.
          </span>
        </div>
        <Input
          placeholder="renounce"
          {...register('confirm')}
          autoComplete="off"
        />
        <div className="flex gap-4">
          <Button
            className="w-full"
            variant="outlined-primary"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button className="w-full" type="submit" disabled={!confirmMatch}>
            Confirm
          </Button>
        </div>
      </form>
    </Modal>
  )
}

const LockManagerCard = ({
  lockAddress,
  manager,
  hasMultipleManagers,
  network,
}: LockManagerCardProps) => {
  const [renounceModal, setRenounceModal] = useState(false)
  const { account } = useAuthenticate()
  const { getWalletService } = useProvider()
  const managerEnsOrAddress = useEns(manager)
  const isLoggedUser = account?.toLowerCase() === manager?.toLowerCase()

  const renounceLockManager = async () => {
    const walletService = await getWalletService(network)
    return await walletService.renounceLockManager({
      lockAddress,
    })
  }

  const renounceLockManagerMutation = useMutation({
    mutationFn: renounceLockManager,
  })

  const onRenounce = async () => {
    const renounceLockManagerPromise = renounceLockManagerMutation.mutateAsync()
    await ToastHelper.promise(renounceLockManagerPromise, {
      loading: 'Removing Lock Manager status.',
      success: `Lock manager renounced for ${minifyAddress(manager)}.`,
      error: `Can't renounce Lock manager for ${minifyAddress(manager)}`,
    })
  }

  const renounce = async () => {
    if (hasMultipleManagers) {
      await onRenounce()
    } else {
      setRenounceModal(true)
    }
  }

  return (
    <>
      <RenounceModal
        isOpen={renounceModal}
        setIsOpen={setRenounceModal}
        onConfirm={onRenounce}
      />
      <div className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg">
        <div className="flex flex-col gap-2 ">
          <span className="text-base text-brand-dark">
            {managerEnsOrAddress}
          </span>
          {isLoggedUser && (
            <span className="text-sm font-semibold text-brand-ui-primary">
              {"That's you"}
            </span>
          )}
        </div>
        {isLoggedUser && (
          <Button size="small" variant="outlined-primary" onClick={renounce}>
            Renounce
          </Button>
        )}
      </div>
    </>
  )
}

export const LockManagerForm = ({
  lockAddress,
  network,
  isManager,
  disabled,
}: LockManagerFormProps) => {
  const localForm = useForm<{ manager: string }>()

  const { handleSubmit, control, setValue } = localForm

  const { manager } = useWatch({
    control,
  })

  const getLock = async () => {
    return await graphService.lock(
      {
        where: {
          address_in: [lockAddress],
        },
      },
      {
        network,
      }
    )
  }

  const addLockManagerMutation = useAddLockManager(lockAddress, network)

  const { isPending, data: lockSubgraph } = useQuery({
    queryKey: [
      'getLockManagerForm',
      lockAddress,
      network,
      addLockManagerMutation.isSuccess,
    ],
    queryFn: getLock,
    refetchInterval: 1000,
  })

  const onAddLockManager = async ({ manager = '' }: any) => {
    if (manager !== '') {
      await addLockManagerMutation.mutateAsync(manager)
      setValue('manager', '')
    }
  }

  const managers = lockSubgraph?.lockManagers ?? []

  const noManagers = managers?.length === 0

  const disableInput = disabled || isPending || addLockManagerMutation.isPending

  return (
    <div className="relative">
      <div className="flex flex-col gap-4">
        {noManagers && !isPending && (
          <span className="text-red-500">
            This lock does not have any Lock Manager.
          </span>
        )}
        {managers?.length > 0 && (
          <div className="grid gap-1">
            <span className="font-semibold">Lock Managers</span>
            <div className="grid gap-2">
              {managers?.map((manager) => (
                <LockManagerCard
                  lockAddress={lockAddress}
                  manager={manager}
                  key={manager}
                  network={network}
                  hasMultipleManagers={managers?.length > 1}
                />
              ))}
            </div>
          </div>
        )}
        {(isPending || addLockManagerMutation.isPending) && (
          <Placeholder.Line size="xl" />
        )}
      </div>
      {isManager && (
        <form
          className="flex flex-col gap-6 mt-8"
          onSubmit={handleSubmit(onAddLockManager)}
        >
          <div className="flex flex-col gap-2">
            <Controller
              name="manager"
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
                      value={manager}
                      disabled={disabled}
                      label="Add manager, please enter the wallet address of theirs."
                      description="Enter a wallet address or an ens name"
                      onChange={(value: any) => {
                        setValue('manager', value)
                      }}
                      onResolveName={onResolveName}
                    />
                  </>
                )
              }}
            />
          </div>
          <Button
            className="w-full md:w-1/2"
            type="submit"
            disabled={disableInput}
            loading={addLockManagerMutation.isPending}
          >
            Add
          </Button>
        </form>
      )}
    </div>
  )
}
