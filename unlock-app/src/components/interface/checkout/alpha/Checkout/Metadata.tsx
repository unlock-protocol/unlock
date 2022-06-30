import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService } from './checkoutMachine'
import { FieldValues, useFieldArray, useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { Button, Input } from '@unlock-protocol/ui'
import { twMerge } from 'tailwind-merge'
import { getAddressForName } from '~/hooks/useEns'
import { Connected } from '../Connected'
import { formResultToMetadata } from '~/utils/userMetadata'
import { useStorageService } from '~/utils/withStorageService'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useActor } from '@xstate/react'
import { Shell } from '../Shell'
import { PoweredByUnlock } from '../PoweredByUnlock'

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
  const [isLoading, setIsLoading] = useState(false)
  const storage = useStorageService()
  const { lock, paywallConfig, quantity } = state.context

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
    <Shell.Root onClose={() => onClose()}>
      <Shell.Head checkoutService={checkoutService} />
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
                label={`Recipient #${index + 1}`}
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
      <footer className="px-6 pt-6 border-t grid items-center">
        <Connected
          injectedProvider={injectedProvider}
          service={checkoutService}
        >
          <Button loading={isLoading} className="w-full" form="metadata">
            {isLoading ? 'Continuing' : 'Next'}
          </Button>
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Shell.Root>
  )
}
