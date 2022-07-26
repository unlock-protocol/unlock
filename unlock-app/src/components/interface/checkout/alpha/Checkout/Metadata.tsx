import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService } from './checkoutMachine'
import { FieldValues, useFieldArray, useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { Button, Input } from '@unlock-protocol/ui'
import { twMerge } from 'tailwind-merge'
import { getAddressForName } from '~/hooks/useEns'
import { Connected } from '../Connected'
import { formResultToMetadata } from '~/utils/userMetadata'
import { useStorageService } from '~/utils/withStorageService'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useActor } from '@xstate/react'
import {
  BackButton,
  CheckoutHead,
  CheckoutTransition,
  CloseButton,
} from '../Shell'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { useCheckoutHeadContent } from '../useCheckoutHeadContent'
import { IconButton, ProgressCircleIcon, ProgressFinishIcon } from '../Progress'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { ethers } from 'ethers'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  onClose(params?: Record<string, string>): void
}

interface FormData {
  metadata: Record<'recipient' | string, string>[]
}

export function Metadata({
  checkoutService,
  injectedProvider,
  onClose,
}: Props) {
  const [state, send] = useActor(checkoutService)
  const { account } = useAuth()
  const storage = useStorageService()
  const { lock, paywallConfig, quantity } = state.context
  const { title, description, iconURL } =
    useCheckoutHeadContent(checkoutService)
  const web3Service = useWeb3Service()

  const metadataInputs =
    paywallConfig.locks[lock!.address].metadataInputs ??
    paywallConfig.metadataInputs

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValidating, isSubmitting },
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

  useEffect(() => {
    if (quantity > fields.length) {
      const fieldsRequired = quantity - fields.length

      Array.from({ length: fieldsRequired }).map((_, index) => {
        if (!index) {
          // fill the first field with the current logged in user address.
          append({
            recipient: account,
          })
        } else {
          append({
            recipient: '',
          })
        }
      })
    } else {
      const fieldsRemove = fields.length - quantity
      Array.from({ length: fieldsRemove }).map((_, index) =>
        remove(fields.length - index)
      )
    }
  }, [quantity, account, fields, append, remove])

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
    <CheckoutTransition>
      <div className="bg-white max-w-md rounded-xl flex flex-col w-full h-[90vh] sm:h-[80vh] max-h-[42rem]">
        <div className="flex items-center justify-between p-6">
          <BackButton onClick={() => send('BACK')} />
          <CloseButton onClick={() => onClose()} />
        </div>
        <CheckoutHead
          title={paywallConfig.title}
          iconURL={iconURL}
          description={description}
        />
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
            <h4 className="text-sm "> {title}</h4>
          </div>
          <div className="border-t-4 w-full flex-1"></div>
          <div className="inline-flex items-center gap-1">
            {paywallConfig.messageToSign && <ProgressCircleIcon disabled />}
            <ProgressCircleIcon disabled />
            <ProgressFinishIcon disabled />
          </div>
        </div>
        <main className="px-6 py-2 overflow-auto h-full">
          <form id="metadata" onSubmit={handleSubmit(onSubmit)}>
            {fields.map((item, index) => (
              <div
                key={item.id}
                className={twMerge(
                  'py-2',
                  fields.length > index + 1
                    ? 'border-b-2 border-brand-gray'
                    : null
                )}
              >
                <Input
                  label={`Recipient #${index + 1}`}
                  size="small"
                  error={
                    errors?.metadata?.[index]?.recipient
                      ?.message as any as string
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
                        ?.message as any as string
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
            ))}
          </form>
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
      </div>
    </CheckoutTransition>
  )
}
