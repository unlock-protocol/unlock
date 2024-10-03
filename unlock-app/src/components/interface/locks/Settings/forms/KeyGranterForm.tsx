import { useQuery } from '@tanstack/react-query'
import {
  Button,
  AddressInput,
  isAddressOrEns,
  Placeholder,
} from '@unlock-protocol/ui'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { BsCreditCard as CreditCardIcon } from 'react-icons/bs'
import { useAuth } from '~/contexts/AuthenticationContext'
import { onResolveName } from '~/utils/resolvers'
import useEns from '~/hooks/useEns'
import { useAddKeyGranter, useRemoveKeyGranter } from '~/hooks/useKeyGranter'

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

const KeyGranterCard = ({
  lockAddress,
  network,
  keyGranter,
  isManager,
}: KeyGranterCardProps) => {
  const { account } = useAuth()

  const keyGranterEnsOrAddress = useEns(keyGranter)
  const isLoggedUser = account?.toLowerCase() === keyGranter?.toLowerCase()
  const PURCHASE_ADDRESSES = [
    '0x22c095c69c38b66afAad4eFd4280D94Ec9D12f4C', // prod purchaser
    '0x903073735Bb6FDB802bd3CDD3b3a2b00C36Bc2A9', // staging purchaser
    '0xd851fe9ba8EfA66e65d7865690bD2B9522C6E99f', // OpenZeppelin purchaser
  ].map((add) => add.toLowerCase())
  const isCreditCardKeyGranter = PURCHASE_ADDRESSES.includes(keyGranter)

  const removeKeyGranterMutation = useRemoveKeyGranter(lockAddress, network)

  const removeKeyGranter = async () => {
    await removeKeyGranterMutation.mutateAsync(keyGranter)
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg">
      <div className="flex flex-col gap-2 ">
        <span className="text-base text-brand-dark">
          {keyGranterEnsOrAddress}{' '}
          {isCreditCardKeyGranter ? <CreditCardIcon size={18} /> : null}
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
        onClick={removeKeyGranter}
      >
        {isLoggedUser ? 'Renounce' : 'Revoke'}
      </Button>
    </div>
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
    const service = new SubgraphService()
    return await service.lock(
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
                    label="Add Key Granter, please enter their wallet addres."
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
