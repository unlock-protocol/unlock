import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService } from './checkoutMachine'
import { useFieldArray, useForm } from 'react-hook-form'
import { Fragment, useEffect, useState } from 'react'
import { Button, Input } from '@unlock-protocol/ui'
import { twMerge } from 'tailwind-merge'
import { getAddressForName, getNameOrAddressForAddress } from '~/hooks/useEns'
import { Connected } from '../Connected'
import { formResultToMetadata } from '~/utils/userMetadata'
import { useStorageService } from '~/utils/withStorageService'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useActor } from '@xstate/react'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { ethers } from 'ethers'
import { useQuery } from 'react-query'
import { useCheckoutSteps } from './useCheckoutItems'
import { MetadataInput } from '~/unlockTypes'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

interface FormData {
  metadata: Record<'recipient' | string, string>[]
}

export function Metadata({ checkoutService, injectedProvider }: Props) {
  const [state, send] = useActor(checkoutService)
  const { account, isUnlockAccount, email } = useAuth()
  const storage = useStorageService()
  const { lock, paywallConfig, quantity } = state.context
  const web3Service = useWeb3Service()
  const locksConfig = paywallConfig.locks[lock!.address]
  const [metadataInputs, setMetadataInputs] = useState<
    MetadataInput[] | undefined
  >(undefined)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    shouldUnregister: false,
    shouldFocusError: true,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  })
  const { fields, append, remove } = useFieldArray({
    name: 'metadata',
    control,
  })
  const { isLoading: isMemberLoading, data: isMember } = useQuery(
    ['isMember', account, lock],
    async () => {
      const total = await web3Service.totalKeys(
        lock!.address,
        account!,
        lock!.network
      )
      return total > 0
    },
    {
      enabled: !!account,
    }
  )

  const { data: address, isLoading: isEnsLoading } = useQuery(
    ['ens', account],
    () => {
      return getNameOrAddressForAddress(account!)
    },
    {
      enabled: !!account,
    }
  )

  const [hideFirstRecipient, setHideFirstRecipient] = useState<boolean>(true)

  useEffect(() => {
    if (quantity > fields.length && !isMemberLoading) {
      const fieldsRequired = quantity - fields.length
      Array.from({ length: fieldsRequired }).map((_, index) => {
        const addAccountAddress = !index && !isMember
        const recipient = addAccountAddress
          ? { recipient: account }
          : { recipient: '' }
        append(recipient, {
          shouldFocus: false,
        })
      })
    } else {
      const fieldsRemove = fields.length - quantity
      Array.from({ length: fieldsRemove }).map((_, index) =>
        remove(fields.length - index)
      )
    }
  }, [quantity, account, fields, append, remove, isMember, isMemberLoading])

  useEffect(() => {
    if (metadataInputs) {
      return
    }

    const emailInput: MetadataInput = {
      type: 'email',
      name: 'email',
      required: true,
      placeholder: 'hello@unlock-protocol.com',
    }

    const inputs: MetadataInput[] =
      locksConfig.metadataInputs || paywallConfig.metadataInputs || []

    if (locksConfig.emailRequired || paywallConfig.emailRequired) {
      inputs.push(emailInput)
    }

    setMetadataInputs(inputs)
  }, [locksConfig, paywallConfig, metadataInputs])

  async function onSubmit(data: FormData) {
    try {
      const users = await Promise.all(
        data.metadata.map(async (item) => {
          const address = await getAddressForName(item.recipient)
          const formattedMetadata = formResultToMetadata(
            item,
            metadataInputs || []
          )
          return {
            userAddress: address,
            metadata: {
              public: formattedMetadata.publicData,
              protected: formattedMetadata.protectedData,
            },
            lockAddress: lock!.address,
          }
        })
      )

      await storage.submitMetadata(users, lock!.network)

      const recipients = users.map((item) => item.userAddress)

      send({
        type: 'SELECT_RECIPIENTS',
        recipients,
      })
    } catch (error) {
      if (error instanceof Error) {
        ToastHelper.error(error.message)
      }
    }
  }
  const isLoading = isSubmitting
  const stepItems = useCheckoutSteps(checkoutService)

  return (
    <Fragment>
      <Stepper position={3} service={checkoutService} items={stepItems} />
      <main className="h-full px-6 py-2 overflow-auto">
        {isMemberLoading || isEnsLoading ? (
          <div className="grid w-full pb-6 gap-y-2">
            <div className="w-full h-8 rounded-full bg-zinc-50 animate-pulse" />
            <div className="w-full h-8 rounded-full bg-zinc-50 animate-pulse" />
            <div className="w-full h-8 rounded-full bg-zinc-50 animate-pulse" />
          </div>
        ) : (
          <form id="metadata" onSubmit={handleSubmit(onSubmit)}>
            {fields.map((item, index) => {
              const hideRecipient = !index && hideFirstRecipient && !isMember
              return (
                <div
                  key={item.id}
                  className={twMerge(
                    'py-2 space-y-2',
                    fields.length > index + 1 ? 'border-b ' : null
                  )}
                >
                  {hideRecipient ? (
                    <div className="space-y-1">
                      <div className="ml-1 text-sm"> Recipient #1 </div>
                      <div className="flex items-center pl-4 pr-2 py-1.5 justify-between bg-gray-200 rounded-lg">
                        <div className="w-32 text-sm truncate">
                          {isUnlockAccount ? email : address}
                        </div>
                        <Button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault()
                            setHideFirstRecipient(false)
                          }}
                          size="tiny"
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Input
                      label={
                        quantity > 1 ? `Recipient #${index + 1}` : 'Recipient'
                      }
                      size="small"
                      disabled={isSubmitting}
                      description="Enter Ethereum address or an ENS"
                      error={errors?.metadata?.[index]?.recipient?.message}
                      {...register(`metadata.${index}.recipient`, {
                        required: 'Ethereum address or an ENS is required',
                        validate: {
                          max_keys: async (value) => {
                            try {
                              const address = await getAddressForName(value)
                              const contract = await web3Service.lockContract(
                                lock!.address,
                                lock!.network
                              )
                              const items = await contract.balanceOf(address)
                              const numberOfMemberships =
                                ethers.BigNumber.from(items).toNumber()
                              return numberOfMemberships <
                                (lock?.maxKeysPerAddress || 1)
                                ? true
                                : 'Address already holds the maximum number of memberships.'
                            } catch (error) {
                              console.error(error)
                              return 'There is a problem with using this address. Try another.'
                            }
                          },
                        },
                      })}
                    />
                  )}
                  {metadataInputs?.map((metadataInputItem) => (
                    <Input
                      key={metadataInputItem.name}
                      label={metadataInputItem.name}
                      defaultValue={metadataInputItem.defaultValue}
                      size="small"
                      disabled={isSubmitting}
                      placeholder={metadataInputItem.placeholder}
                      type={metadataInputItem.type}
                      error={
                        errors?.metadata?.[index]?.[metadataInputItem.name]
                          ?.message
                      }
                      {...register(
                        `metadata.${index}.${metadataInputItem.name}`,
                        {
                          required:
                            metadataInputItem.required &&
                            `${metadataInputItem.name} is required`,
                        }
                      )}
                    />
                  ))}
                </div>
              )
            })}
          </form>
        )}
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <Connected
          injectedProvider={injectedProvider}
          service={checkoutService}
        >
          <Button
            loading={isLoading}
            disabled={isLoading || isMemberLoading}
            className="w-full"
            form="metadata"
          >
            {isLoading ? 'Continuing' : 'Next'}
          </Button>
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
