import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService } from './checkoutMachine'
import { FieldValues, useFieldArray, useForm } from 'react-hook-form'
import { Fragment, useEffect, useState } from 'react'
import { Button, Input } from '@unlock-protocol/ui'
import { twMerge } from 'tailwind-merge'
import { getAddressForName } from '~/hooks/useEns'
import { Connected } from '../Connected'
import { formResultToMetadata } from '~/utils/userMetadata'
import { useStorageService } from '~/utils/withStorageService'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useActor } from '@xstate/react'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { IconButton, ProgressCircleIcon, ProgressFinishIcon } from '../Progress'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { ethers } from 'ethers'
import { useQuery } from 'react-query'

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

  const metadataInputs =
    paywallConfig.locks[lock!.address].metadataInputs ??
    paywallConfig.metadataInputs

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    shouldUnregister: false,
    shouldFocusError: true,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  })
  const { fields, append, remove } = useFieldArray({
    name: 'metadata',
    control,
  })
  const { isLoading: isMembershipsLoading, data: memberships } = useQuery(
    ['memberships', account, JSON.stringify(paywallConfig)],
    async () => {
      const memberships = await Promise.all(
        Object.entries(paywallConfig.locks).map(async ([lock, { network }]) => {
          const valid = await web3Service.getHasValidKey(
            lock,
            account!,
            network || paywallConfig.network || 1
          )
          if (valid) {
            return lock
          }
        })
      )
      return memberships.filter((item) => item)
    },
    {
      enabled: !!account,
    }
  )

  const existingMember = !!memberships?.includes(lock!.address)

  const [hideFirstRecipient, setHideFirstRecipient] = useState<boolean>(
    !existingMember
  )

  useEffect(() => {
    if (quantity > fields.length && !isMembershipsLoading) {
      const fieldsRequired = quantity - fields.length
      Array.from({ length: fieldsRequired }).map((_, index) => {
        const addAccountAddress = !index && !existingMember
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
  }, [
    quantity,
    account,
    fields,
    append,
    remove,
    existingMember,
    isMembershipsLoading,
  ])

  async function onSubmit(data: FieldValues) {
    try {
      const formData = data as FormData
      const recipients = await Promise.all(
        formData.metadata.map(async (item) => {
          const address = await getAddressForName(item.recipient)
          return address
        })
      )
      if (metadataInputs) {
        const users = formData.metadata.map(({ recipient, ...rest }) => {
          const formattedMetadata = formResultToMetadata(rest, metadataInputs!)
          return {
            userAddress: recipient,
            metadata: {
              public: formattedMetadata.publicData,
              protected: formattedMetadata.protectedData,
            },
            lockAddress: lock!.address,
          }
        })
        await storage.submitMetadata(users, lock!.network)
      }
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

  return (
    <Fragment>
      <div className="flex px-6 p-2 flex-wrap items-center w-full gap-2">
        <div className="flex items-center gap-2 col-span-4">
          <div className="flex items-center gap-0.5">
            <IconButton
              title="Select lock"
              icon={ProgressCircleIcon}
              onClick={() => {
                send('SELECT')
              }}
            />
            <IconButton
              title="Choose quantity"
              icon={ProgressCircleIcon}
              onClick={() => {
                send('QUANTITY')
              }}
            />
            <ProgressCircleIcon />
          </div>
          <h4 className="text-sm "> Add recipient info </h4>
        </div>
        <div className="border-t-4 w-full flex-1"> </div>
        <div className="inline-flex items-center gap-1">
          <ProgressCircleIcon disabled />
          {paywallConfig.messageToSign && <ProgressCircleIcon disabled />}
          <ProgressCircleIcon disabled />
          <ProgressFinishIcon disabled />
        </div>
      </div>
      <main className="px-6 py-2 overflow-auto h-full">
        {isMembershipsLoading ? (
          <div className="grid w-full gap-y-2 pb-6">
            <div className="w-full h-8 bg-zinc-50 rounded-full animate-pulse" />
            <div className="w-full h-8 bg-zinc-50 rounded-full animate-pulse" />
            <div className="w-full h-8 bg-zinc-50 rounded-full animate-pulse" />
          </div>
        ) : (
          <form id="metadata" onSubmit={handleSubmit(onSubmit)}>
            {fields.map((item, index) => {
              const hideRecipient = !index && hideFirstRecipient
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
                      <div className="text-sm ml-1"> Recipient #1 </div>
                      <div className="flex items-center pl-4 pr-2 py-1.5 justify-between bg-gray-200 rounded-lg">
                        <div className="w-32 text-sm truncate">
                          {isUnlockAccount ? email : account}
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
                      label={`Recipient #${index + 1}`}
                      size="small"
                      error={
                        errors?.metadata?.[index]?.recipient
                          ?.message as unknown as string
                      }
                      {...register(`metadata.${index}.recipient`, {
                        required: 'Recipient is required',
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
                      placeholder={metadataInputItem.placeholder}
                      type={metadataInputItem.type}
                      error={
                        errors?.metadata?.[index]?.[metadataInputItem.name]
                          ?.message as unknown as string
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
      <footer className="px-6 pt-6 border-t grid items-center">
        <Connected
          injectedProvider={injectedProvider}
          service={checkoutService}
        >
          <Button
            loading={isLoading}
            disabled={isLoading}
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
