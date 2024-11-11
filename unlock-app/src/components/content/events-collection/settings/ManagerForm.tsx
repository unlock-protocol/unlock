import {
  Button,
  Input,
  AddressInput,
  isAddressOrEns,
  Placeholder,
  Modal,
} from '@unlock-protocol/ui'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { onResolveName } from '~/utils/resolvers'
import { EventCollection } from '@unlock-protocol/unlock-js'
import { useEventCollectionManagers } from '~/hooks/useEventCollectionManagers'
import { WrappedAddress } from '~/components/interface/WrappedAddress'
import { useAuthenticate } from '~/hooks/useAuthenticate'

interface CollectionManagerFormProps {
  eventCollection: EventCollection
  isManager: boolean
  disabled: boolean
}

interface CollectionManagerCardProps {
  collectionManagers: string[]
  manager: string
  hasMultipleManagers: boolean
  onRemove: (managerAddress: string) => Promise<void>
  isRemoving: boolean
}

interface RenounceModalFormProps {
  confirm: string
}

interface RenounceModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onConfirm: () => Promise<any>
}

interface RemoveModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onConfirm: () => Promise<any>
  managerAddress: string
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
      <div className="flex flex-col gap-6 text-center">
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
            You are about to permanently renounce yourself as a Collection
            manager. You will not be able to revert this action. Please type
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
          <Button
            className="w-full"
            onClick={handleSubmit(onRenounce)}
            disabled={!confirmMatch}
          >
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  )
}

const RemoveModal = ({
  isOpen,
  setIsOpen,
  onConfirm,
  managerAddress,
}: RemoveModalProps) => {
  const onRemove = async () => {
    await onConfirm()
    setIsOpen(false)
  }

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} spacing="none">
      <div className="flex flex-col gap-6 text-center mb-5">
        <div className="overflow-hidden bg-center rounded-lg">
          <img
            className="object-cover h-40"
            src="/images/illustrations/img-error.svg"
            alt="img error"
          />
        </div>
        <div className="flex flex-col gap-4 items-center">
          <h3 className="text-xl font-bold text-brand-dark">Remove Manager</h3>
          <span className="text-md text-center text-brand-dark flex items-center">
            Are you sure you want to remove{' '}
            <WrappedAddress
              className="mx-2 font-semibold"
              address={managerAddress}
              showExternalLink={false}
              showCopyIcon={false}
            />{' '}
            as a manager?
          </span>
        </div>
        <div className="flex gap-4 mx-3">
          <Button
            className="w-full"
            variant="outlined-primary"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button className="w-full" onClick={onRemove}>
            Remove
          </Button>
        </div>
      </div>
    </Modal>
  )
}

const CollectionManagerCard = ({
  manager,
  collectionManagers,
  hasMultipleManagers,
  onRemove,
  isRemoving,
}: CollectionManagerCardProps) => {
  const [renounceModal, setRenounceModal] = useState(false)
  const [removeModal, setRemoveModal] = useState(false)
  const { account } = useAuthenticate()
  const isLoggedUser = account === manager
  const isManager = collectionManagers.includes(manager)

  const onRenounce = async () => {
    await onRemove(manager)
  }

  const renounce = async () => {
    if (hasMultipleManagers) {
      await onRenounce()
    } else {
      setRenounceModal(true)
    }
  }

  // Ensure manager is a valid string
  const managerAddress = typeof manager === 'string' ? manager : ''

  return (
    <>
      <RenounceModal
        isOpen={renounceModal}
        setIsOpen={setRenounceModal}
        onConfirm={onRenounce}
      />
      <RemoveModal
        isOpen={removeModal}
        setIsOpen={setRemoveModal}
        onConfirm={() => onRemove(manager)}
        managerAddress={managerAddress}
      />
      <div className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg">
        <div className="flex flex-col gap-2">
          {managerAddress ? (
            <WrappedAddress address={managerAddress} showExternalLink={false} />
          ) : (
            <span className="text-sm font-semibold text-brand-ui-primary">
              {"That's you"}
            </span>
          )}
          {isLoggedUser && (
            <span className="text-sm font-semibold text-brand-ui-primary">
              {"That's you"}
            </span>
          )}
        </div>
        {isLoggedUser && (
          <Button
            size="small"
            variant="outlined-primary"
            onClick={renounce}
            disabled={isLoggedUser && collectionManagers.length === 1}
          >
            Renounce
          </Button>
        )}
        {isManager && !isLoggedUser && (
          <Button
            size="small"
            variant="outlined-primary"
            onClick={() => setRemoveModal(true)}
            loading={isRemoving}
          >
            Remove
          </Button>
        )}
      </div>
    </>
  )
}

export const CollectionManagerForm = ({
  eventCollection,
  isManager,
  disabled,
}: CollectionManagerFormProps) => {
  const {
    collectionManagers,
    isLoadingCollectionManagers,
    addManager,
    removeManager,
    isAddingManager,
    isRemovingManager,
  } = useEventCollectionManagers(eventCollection.slug || '')

  const { handleSubmit, control, reset } = useForm<{
    manager: string
  }>({
    mode: 'onChange',
  })
  const { manager } = useWatch({ control })

  const onSubmit = async (data: { manager: string }) => {
    if (data.manager) {
      await addManager(data.manager)
      reset({ manager: '' })
    }
  }

  const handleRemoveManager = async (managerAddress: string) => {
    await removeManager(managerAddress)
  }

  return (
    <div className="relative">
      <div className="flex flex-col gap-4">
        <div className="grid gap-1">
          <span className="font-semibold">Collection Managers</span>
          <div className="grid gap-2">
            {isLoadingCollectionManagers ? (
              <Placeholder.Root>
                <Placeholder.Card />
              </Placeholder.Root>
            ) : (
              collectionManagers?.map((manager) => (
                <CollectionManagerCard
                  key={manager}
                  collectionManagers={collectionManagers}
                  manager={manager}
                  hasMultipleManagers={collectionManagers.length > 1}
                  onRemove={handleRemoveManager}
                  isRemoving={isRemovingManager}
                />
              ))
            )}
          </div>
        </div>
      </div>
      {isManager && (
        <div className="flex flex-col gap-6 mt-8">
          <div className="flex flex-col gap-2">
            <Controller
              name="manager"
              control={control}
              rules={{
                required: 'Manager address is required',
                validate: isAddressOrEns,
              }}
              render={({ field, fieldState }) => (
                <>
                  <AddressInput
                    {...field}
                    withIcon
                    disabled={disabled}
                    label="Add Manager"
                    description="Enter a wallet address or an ENS name"
                    onChange={(value: any) => {
                      field.onChange(value)
                    }}
                    onResolveName={onResolveName}
                  />
                  {fieldState.error && (
                    <span className="text-red-500 text-sm">
                      {fieldState.error.message}
                    </span>
                  )}
                </>
              )}
            />
          </div>
          <Button
            className="w-full md:w-1/2"
            onClick={handleSubmit(onSubmit)}
            disabled={isAddingManager || disabled || !manager}
            loading={isAddingManager}
          >
            Add Manager
          </Button>
        </div>
      )}
    </div>
  )
}
