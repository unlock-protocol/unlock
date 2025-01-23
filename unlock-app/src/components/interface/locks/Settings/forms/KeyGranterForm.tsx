import { useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useQuery } from '@tanstack/react-query'
import {
  Button,
  AddressInput,
  isAddressOrEns,
  Placeholder,
} from '@unlock-protocol/ui'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { BsCreditCard as CreditCardIcon } from 'react-icons/bs'
import { onResolveName } from '~/utils/resolvers'
import useEns from '~/hooks/useEns'
import {
  useAddKeyGranter,
  useRemoveKeyGranter,
  useKeyGranter,
} from '~/hooks/useKeyGranter'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { graphService } from '~/config/subgraph'

interface KeyGranterFormProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
}

interface KeyGranterCardProps {
  lockAddress: string
  network: number
  keyGranter: string
  isManager: boolean
}

interface RemoveKeyGranterModalProps {
  isOpen: boolean
  isCreditCardGranter: boolean
  isLoading: boolean
  setIsOpen: (open: boolean) => void
  onConfirm: () => Promise<any>
}

const RemoveKeyGranterModal = ({
  isOpen,
  isCreditCardGranter,
  isLoading,
  setIsOpen,
  onConfirm,
}: RemoveKeyGranterModalProps) => {
  const onRemoveKeyGranter = async () => {
    await onConfirm()
    setIsOpen(false)
  }

  return (
    <Transition show={isOpen} appear>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => {
          setIsOpen(false)
        }}
        open
      >
        <div className="fixed inset-0 bg-opacity-25 backdrop-filter backdrop-blur-sm bg-zinc-500" />
        <Transition.Child
          enter="transition ease-out duration-300"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0 translate-y-1"
        >
          <div className="fixed inset-0 p-6 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full">
              <Dialog.Panel className="w-full max-w-md p-8 bg-white rounded-2xl">
                <div className="overflow-hidden bg-center rounded-lg">
                  <img
                    className="object-cover h-40"
                    src="/images/illustrations/img-error.svg"
                    alt="img error"
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <span className="text-base text-brand-dark p-6">
                    {isCreditCardGranter
                      ? 'If you remove this key granter, credit card purchases for your contracts will be disabled'
                      : 'Please confirm you want to remove this key granter'}
                  </span>
                </div>
                <div className="flex gap-4">
                  <Button
                    className="w-full"
                    variant="outlined-primary"
                    onClick={() => setIsOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="w-full"
                    onClick={onRemoveKeyGranter}
                    disabled={isLoading}
                  >
                    Confirm
                  </Button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  )
}

const KeyGranterCard = ({
  lockAddress,
  network,
  keyGranter,
  isManager,
}: KeyGranterCardProps) => {
  const [modalOpen, setModalOpen] = useState(false)

  const { account } = useAuthenticate()

  const keyGranterEnsOrAddress = useEns(keyGranter)
  const isLoggedUser = account?.toLowerCase() === keyGranter?.toLowerCase()

  const { data: creditCardKeyGranter } = useKeyGranter({
    network,
  })
  const isCreditCardGranter = creditCardKeyGranter?.toLowerCase() === keyGranter

  const removeKeyGranterMutation = useRemoveKeyGranter(lockAddress, network)

  const removeKeyGranter = async () => {
    await removeKeyGranterMutation.mutateAsync(keyGranter)
  }

  return (
    <>
      <RemoveKeyGranterModal
        isOpen={modalOpen}
        isCreditCardGranter={isCreditCardGranter}
        isLoading={removeKeyGranterMutation.isPending}
        setIsOpen={setModalOpen}
        onConfirm={removeKeyGranter}
      />
      <div className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg">
        <div className="flex flex-col gap-2 ">
          <span className="text-base text-brand-dark">
            {!isCreditCardGranter ? (
              keyGranterEnsOrAddress
            ) : (
              <div className="flex gap-2 items-center">
                <CreditCardIcon size={18} />
                <span>Credit card granter</span>
              </div>
            )}
          </span>
          {isLoggedUser && (
            <span className="text-sm font-semibold text-brand-ui-primary">
              {"That's you"}
            </span>
          )}
        </div>
        <Button
          size="small"
          variant="outlined-primary"
          disabled={!isManager}
          loading={removeKeyGranterMutation.isPending}
          onClick={() => setModalOpen(true)}
        >
          {isLoggedUser ? 'Renounce' : 'Revoke'}
        </Button>
      </div>
    </>
  )
}

export const KeyGranterForm = ({
  lockAddress,
  network,
  isManager,
  disabled,
}: KeyGranterFormProps) => {
  const localForm = useForm<{ keyGranter: string }>()

  const { handleSubmit, control, setValue } = localForm

  const { keyGranter } = useWatch({
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

  const addKeyGranterMutation = useAddKeyGranter(lockAddress, network)

  const { isPending, data: lock } = useQuery({
    queryKey: ['fetchKeyGranters', lockAddress, network],
    queryFn: getLock,
  })

  const addKeyGranter = async ({ keyGranter = '' }: any) => {
    if (keyGranter !== '') {
      await addKeyGranterMutation.mutateAsync(keyGranter)
      setValue('keyGranter', '')
    }
  }

  const keyGranters = lock?.keyGranters ?? []

  const noKeyGranters = keyGranters?.length === 0

  const disableInput = disabled || isPending || addKeyGranterMutation.isPending

  return (
    <div className="relative">
      <div className="flex flex-col gap-4">
        {noKeyGranters && !isPending && (
          <span className="text-red-500">
            This lock does not have any Key Granter.
          </span>
        )}
        {keyGranters?.length > 0 && (
          <div className="grid gap-1">
            <span className="font-semibold">Key Granters</span>
            <div className="grid gap-2">
              {keyGranters?.map((keyGranter) => (
                <KeyGranterCard
                  lockAddress={lockAddress}
                  network={network}
                  keyGranter={keyGranter}
                  isManager={isManager}
                  key={keyGranter}
                />
              ))}
            </div>
          </div>
        )}
        {(isPending || addKeyGranterMutation.isPending) && (
          <Placeholder.Line size="xl" />
        )}
      </div>
      {isManager && (
        <form
          className="flex flex-col gap-6 mt-8"
          onSubmit={handleSubmit(addKeyGranter)}
        >
          <div className="flex flex-col gap-2">
            <Controller
              name="keyGranter"
              control={control}
              rules={{
                required: true,
                validate: isAddressOrEns,
              }}
              render={() => {
                return (
                  <AddressInput
                    withIcon
                    value={keyGranter}
                    disabled={disabled}
                    label="Add Key Granter, please enter their wallet address."
                    description="Enter a wallet address or an ens name"
                    onChange={(value: any) => {
                      setValue('keyGranter', value)
                    }}
                    onResolveName={onResolveName}
                  />
                )
              }}
            />
          </div>
          <Button
            className="w-full md:w-1/2"
            type="submit"
            disabled={disableInput}
            loading={addKeyGranterMutation.isPending}
          >
            Add
          </Button>
        </form>
      )}
    </div>
  )
}
