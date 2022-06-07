import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutState, CheckoutStateDispatch } from '../useCheckoutState'
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
  dispatch: CheckoutStateDispatch
  state: CheckoutState
}

interface FormData {
  metadata: Record<'recipient' | string, string>[]
}

export function Metadata({ dispatch, state, paywallConfig }: Props) {
  const { account, deAuthenticate } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const storage = useStorageService()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm()
  const { fields, append, remove } = useFieldArray({
    name: 'metadata',
    control,
  })

  useEffect(() => {
    if (state.quantity!.count > fields.length) {
      const fieldsRequired = state.quantity!.count - fields.length

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
      const fieldsRemove = fields.length - state.quantity!.count
      new Array(fieldsRemove)
        .fill(0)
        .map((_, index) => remove(fields.length - index))
    }
  }, [state.quantity, account, fields, append, remove])

  const metadataInputs =
    paywallConfig.locks[state.lock!.address].metadataInputs ??
    paywallConfig.metadataInputs

  async function onSubmit(data: FieldValues) {
    setIsLoading(true)

    const formData = data as FormData
    const recipients = await Promise.all(
      formData.metadata.map(async (item) => {
        const address = await getAddressForName(item.recipient)
        return address
      })
    )

    dispatch({
      type: 'ADD_RECIPIENTS',
      payload: {
        recipients,
      },
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
          lockAddress: state.lock!.address,
        }
      })
      await storage.submitMetadata(users, state.lock!.network)
    }

    setIsLoading(false)

    if (paywallConfig.captcha) {
      dispatch({
        type: 'CONTINUE',
        payload: {
          continue: 'CAPTCHA',
        },
      })
    } else {
      dispatch({
        type: 'CONTINUE',
        payload: {
          continue: 'CONFIRM',
        },
      })
    }
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
