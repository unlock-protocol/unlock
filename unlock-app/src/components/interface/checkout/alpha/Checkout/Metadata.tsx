import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutState, CheckoutSend } from './checkoutMachine'
import { PaywallConfig } from '~/unlockTypes'
import { FieldValues, useFieldArray, useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { Button, Input } from '@unlock-protocol/ui'
import { twMerge } from 'tailwind-merge'
import { getAddressForName } from '~/hooks/useEns'
import { Connected } from '../Connected'
import { formResultToMetadata } from '~/utils/userMetadata'
import { useStorageService } from '~/utils/withStorageService'
import { useAuthenticateHandler } from '~/hooks/useAuthenticateHandler'
import { ToastHelper } from '~/components/helpers/toast.helper'

interface Props {
  injectedProvider: unknown
  paywallConfig: PaywallConfig
  send: CheckoutSend
  state: CheckoutState
}

interface FormData {
  metadata: Record<'recipient' | string, string>[]
}

export function Metadata({ send, state, injectedProvider }: Props) {
  const { lock, paywallConfig, quantity } = state.context
  const { account, deAuthenticate } = useAuth()
  const { authenticateWithProvider } = useAuthenticateHandler({
    injectedProvider,
  })
  const [isLoading, setIsLoading] = useState(false)
  const storage = useStorageService()
  const metadataInputs =
    paywallConfig.locks[lock!.address].metadataInputs ??
    paywallConfig.metadataInputs

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    shouldUnregister: false,
  })
  const { fields, append, remove } = useFieldArray({
    name: 'metadata',
    control,
  })

  useEffect(() => {
    if (quantity > fields.length) {
      const fieldsRequired = quantity - fields.length

      new Array(fieldsRequired).fill(0).map((_, index) => {
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
      new Array(fieldsRemove)
        .fill(0)
        .map((_, index) => remove(fields.length - index))
    }
  }, [quantity, account, fields, append, remove])

  async function onSubmit(data: FieldValues) {
    try {
      setIsLoading(true)
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
      setIsLoading(false)
      send({
        type: 'SELECT_RECIPIENTS',
        recipients,
      })
    } catch (error) {
      if (error instanceof Error) {
        ToastHelper.error(error.message)
      }
      setIsLoading(false)
    }
  }
  return (
    <div>
      <main className="p-6 overflow-auto h-64 sm:h-72">
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
                label="Recipient"
                size="small"
                error={errors?.metadata?.[index]?.recipient?.message}
                {...register(`metadata.${index}.recipient`, {
                  required: 'Recipient is required',
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
                    errors?.metadata?.[index]?.[metadataInputItem.name]?.message
                  }
                  {...register(`metadata.${index}.${metadataInputItem.name}`, {
                    required:
                      metadataInputItem.required &&
                      `${metadataInputItem.name} is required`,
                  })}
                />
              ))}
            </div>
          ))}
        </form>
      </main>
      <footer className="p-6 border-t grid items-center">
        <Connected
          account={account}
          authenticateWithProvider={authenticateWithProvider}
          onDisconnect={() => {
            deAuthenticate()
            send('DISCONNECT')
          }}
          onUnlockAccount={() => {
            send('UNLOCK_ACCOUNT')
          }}
        >
          <Button loading={isLoading} className="w-full" form="metadata">
            {isLoading ? 'Continuing' : 'Next'}
          </Button>
        </Connected>
      </footer>
    </div>
  )
}
