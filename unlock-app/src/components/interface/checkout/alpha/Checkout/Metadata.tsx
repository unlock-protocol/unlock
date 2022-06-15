import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutState, CheckoutSend } from '../checkoutMachine'
import { PaywallConfig } from '~/unlockTypes'
import { Shell } from '../Shell'
import { FieldValues, useFieldArray, useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { Button, Input } from '@unlock-protocol/ui'
import { twMerge } from 'tailwind-merge'
import { getAddressForName } from '~/hooks/useEns'
import { LoggedIn } from '../Bottom'
import { formResultToMetadata } from '~/utils/userMetadata'
import { useStorageService } from '~/utils/withStorageService'

interface Props {
  injectedProvider: unknown
  paywallConfig: PaywallConfig
  send: CheckoutSend
  state: CheckoutState
}

interface FormData {
  metadata: Record<'recipient' | string, string>[]
}

export function Metadata({ send, state }: Props) {
  const { lock, paywallConfig, quantity } = state.context
  const { account, deAuthenticate } = useAuth()
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
    setIsLoading(true)
    const formData = data as FormData
    const recipients = await Promise.all(
      formData.metadata.map(async (item) => {
        const address = await getAddressForName(item.recipient)
        return address
      })
    )
    send({
      type: 'SELECT_RECIPIENTS',
      recipients,
    })
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
    send('CONTINUE')
    setIsLoading(false)
  }
  return (
    <>
      <Shell.Content>
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
      </Shell.Content>
      <Shell.Footer>
        <div className="space-y-2">
          <Button loading={isLoading} className="w-full" form="metadata">
            {isLoading ? 'Continuing' : 'Next'}
          </Button>
          <LoggedIn account={account!} onDisconnect={() => deAuthenticate()} />
        </div>
      </Shell.Footer>
    </>
  )
}
