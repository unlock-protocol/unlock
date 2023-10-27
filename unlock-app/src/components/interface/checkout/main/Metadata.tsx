import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService, LockState } from './checkoutMachine'
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form'
import {
  ChangeEvent,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Button, Input, Placeholder } from '@unlock-protocol/ui'
import { twMerge } from 'tailwind-merge'
import { getAddressForName } from '~/hooks/useEns'
import { Connected } from '../Connected'
import { formResultToMetadata } from '~/utils/userMetadata'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useActor } from '@xstate/react'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useQuery } from '@tanstack/react-query'
import { Lock } from '~/unlockTypes'
import { KeyManager } from '@unlock-protocol/unlock-js'
import { useConfig } from '~/utils/withConfig'
import { Toggle } from '@unlock-protocol/ui'
import {
  MetadataInputType as MetadataInput,
  PaywallConfigType,
} from '@unlock-protocol/core'
import { useUpdateUsersMetadata } from '~/hooks/useUserMetadata'
interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

interface FormData {
  metadata: Record<'recipient' | string, string>[]
}

interface RecipientInputProps {
  metadataInputs?: MetadataInput[]
  disabled?: boolean
  id: number
  hideFirstRecipient?: boolean
  lock: Lock
  checkoutService: CheckoutService
}

export const MetadataInputs = ({
  checkoutService,
  metadataInputs,
  disabled,
  id,
  lock,
  hideFirstRecipient,
}: RecipientInputProps) => {
  const [state] = useActor(checkoutService)
  const { paywallConfig } = state.context
  const [hideRecipientAddress, setHideRecipientAddress] = useState<boolean>(
    hideFirstRecipient || false
  )
  const { account, isUnlockAccount, email } = useAuth()
  const config = useConfig()
  const [useEmail, setUseEmail] = useState(false)
  const web3Service = useWeb3Service()
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<FormData>()
  const networkConfig = config.networks[lock.network]

  const onRecipientChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      let recipient = value
      if (useEmail && networkConfig.keyManagerAddress) {
        const keyManager = new KeyManager(config.networks)
        recipient = keyManager.createTransferAddress({
          params: {
            email: event.target.value,
            lockAddress: lock!.address,
          },
        })
        setValue(`metadata.${id}.email`, value)
        setValue(`metadata.${id}.keyManager`, networkConfig.keyManagerAddress)
      } else {
        setValue(`metadata.${id}.keyManager`, '')
      }
      return recipient
    },
    [setValue, useEmail, id, lock, config.networks, networkConfig]
  )

  const required = useEmail ? 'Email is required' : 'Wallet Address is required'
  const labelText = useEmail ? 'Email' : 'Wallet'
  const label = id >= 1 ? `${labelText} #${id + 1}` : labelText
  const description = useEmail
    ? 'Enter the email address that will receive the membership NFT'
    : 'Enter the wallet address or an ENS that will receive the membership NFT'
  const error = errors?.metadata?.[id]?.recipient?.message
  const placeholder = useEmail ? 'user@email.com' : '0x...'
  const inputClass = twMerge(
    'box-border flex-1 block w-full transition-all border pl-2.5 py-1.5 text-sm border-gray-400 rounded-lg shadow-sm hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none disabled:bg-gray-100',
    error &&
      'border-brand-secondary hover:border-brand-secondary focus:border-brand-secondary focus:ring-brand-secondary'
  )

  const recipient = recipientFromConfig(paywallConfig, lock) || account

  return (
    <div className="grid gap-2">
      {hideRecipientAddress ? (
        <div className="space-y-1">
          <div className="ml-1 text-sm">
            {isUnlockAccount ? 'Email' : label}:
          </div>
          <div className="flex items-center pl-4 pr-2 py-1.5 justify-between bg-gray-200 rounded-lg">
            <div className="w-32 text-sm truncate">
              {isUnlockAccount ? email : recipient}
            </div>
            <Button
              type="button"
              onClick={(event) => {
                event.preventDefault()
                setHideRecipientAddress(false)
              }}
              size="tiny"
            >
              Change
            </Button>
          </div>
          <p className="text-xs text-gray-600">
            {isUnlockAccount
              ? 'The email address that will receive the membership NFT'
              : 'The wallet address that will receive the membership NFT'}
          </p>
        </div>
      ) : (
        <Controller
          name={`metadata.${id}.recipient`}
          rules={{
            required,
            validate: {
              max_keys: async (value) => {
                try {
                  const address = await getAddressForName(value)
                  const numberOfMemberships = await web3Service.balanceOf(
                    lock!.address,
                    address,
                    lock!.network
                  )
                  return numberOfMemberships < (lock?.maxKeysPerAddress || 1)
                    ? true
                    : 'Address already holds the maximum number of memberships.'
                } catch (error) {
                  console.error(error)
                  return 'There is a problem with using this address. Try another.'
                }
              },
            },
          }}
          render={({ field: { onChange, ref, onBlur } }) => {
            return (
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm" htmlFor={label}>
                    {label}:
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="text-sm">No wallet address?</div>
                    <Toggle
                      value={useEmail}
                      onChange={(value) => {
                        setUseEmail(value)
                      }}
                      size="small"
                    />
                  </div>
                </div>
                <input
                  className={inputClass}
                  placeholder={placeholder}
                  name={label}
                  id={label}
                  type={useEmail ? 'email' : 'text'}
                  disabled={disabled}
                  onChange={(event) => {
                    onChange(onRecipientChange(event))
                  }}
                  ref={ref}
                  onBlur={onBlur}
                  autoComplete={useEmail ? 'email' : label}
                />
                {description && !error && (
                  <p className="text-xs text-gray-600"> {description} </p>
                )}
                {error && <p className="text-xs text-red-500">{error}</p>}
              </div>
            )
          }}
        />
      )}

      {metadataInputs
        ?.filter((item) => {
          return !(
            useEmail &&
            ['email', 'email-address', 'emailaddress'].includes(
              item.name.toLowerCase()
            )
          )
        })
        .map((metadataInputItem) => {
          const {
            name,
            label,
            defaultValue,
            placeholder,
            type,
            required,
            value,
          } = metadataInputItem ?? {}
          const inputLabel = label || name
          return (
            <Input
              key={name}
              label={`${inputLabel}:`}
              autoComplete={inputLabel}
              defaultValue={defaultValue}
              size="small"
              disabled={disabled}
              placeholder={placeholder}
              type={type}
              error={errors?.metadata?.[id]?.[name]?.message}
              {...register(`metadata.${id}.${name}`, {
                required: required && `${inputLabel} is required`,
                value,
              })}
            />
          )
        })}
    </div>
  )
}

const emailInput: MetadataInput = {
  type: 'email',
  name: 'email',
  label: 'Email',
  required: true,
  placeholder: 'your@email.com',
}

export function Metadata({ checkoutService, injectedProvider }: Props) {
  const [state, send] = useActor(checkoutService)
  const { account } = useAuth()
  const { lock, paywallConfig, quantity } = state.context
  const web3Service = useWeb3Service()
  const locksConfig = paywallConfig.locks[lock!.address]
  const isEmailRequired =
    locksConfig.emailRequired || paywallConfig.emailRequired
  const metadataInputs = useMemo(() => {
    const inputs =
      locksConfig.metadataInputs || paywallConfig.metadataInputs || []
    if (isEmailRequired) {
      return [emailInput, ...inputs]
    } else {
      return inputs
    }
  }, [
    locksConfig.metadataInputs,
    paywallConfig.metadataInputs,
    isEmailRequired,
  ])
  const { mutateAsync: updateUsersMetadata } = useUpdateUsersMetadata()
  const methods = useForm<FormData>({
    shouldUnregister: false,
    shouldFocusError: true,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods

  const { fields, append, remove } = useFieldArray({
    name: 'metadata',
    control,
  })

  const recipient = recipientFromConfig(paywallConfig, lock) || account || ''

  const { isInitialLoading: isMemberLoading, data: isMember } = useQuery(
    ['isMember', recipient, lock],
    async () => {
      const total = await web3Service.totalKeys(
        lock!.address,
        recipient!,
        lock!.network
      )
      return total > 0
    },
    {
      enabled: !!recipient,
    }
  )

  useEffect(() => {
    if (recipient && quantity > fields.length && !isMemberLoading) {
      const fieldsRequired = quantity - fields.length
      Array.from({ length: fieldsRequired }).map((_, index) => {
        const addAccountAddress = !index && !isMember
        const recipients = addAccountAddress ? { recipient } : { recipient: '' }
        append(recipients, {
          shouldFocus: false,
        })
      })
    } else {
      const fieldsRemove = fields.length - quantity
      Array.from({ length: fieldsRemove }).map((_, index) =>
        remove(fields.length - index)
      )
    }
  }, [quantity, recipient, fields, append, remove, isMember, isMemberLoading])

  async function onSubmit(data: FormData) {
    try {
      data.metadata = await Promise.all(
        data.metadata.map(async (item) => {
          const address = await getAddressForName(item.recipient)
          return {
            ...item,
            recipient: address,
          }
        })
      )
      const metadata = await Promise.all(
        data.metadata.map(({ recipient, keyManager, ...props }) => {
          const formattedMetadata = formResultToMetadata(
            props,
            metadataInputs || []
          )
          return {
            userAddress: recipient,
            network: lock!.network,
            metadata: {
              public: formattedMetadata.publicData,
              protected: formattedMetadata.protectedData,
            },
            lockAddress: lock!.address,
          }
        })
      )
      const recipients = data.metadata.map((item) => item.recipient)
      const keyManagers = data.metadata.map(
        (item) => item.keyManager || item.recipient
      )
      await updateUsersMetadata(metadata)
      send({
        type: 'SELECT_RECIPIENTS',
        recipients,
        keyManagers,
        metadata,
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
      <Stepper service={checkoutService} />
      <main className="h-full px-6 py-2 overflow-auto">
        {isMemberLoading ? (
          <Placeholder.Root>
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Root>
        ) : (
          <form id="metadata" onSubmit={handleSubmit(onSubmit)}>
            {fields.map((item, index) => {
              const hideRecipient = !index && !isMember
              return (
                <div
                  key={item.id}
                  className={twMerge(
                    'py-2 space-y-2',
                    fields.length > index + 1 ? 'border-b ' : null
                  )}
                >
                  <FormProvider {...methods}>
                    <MetadataInputs
                      checkoutService={checkoutService}
                      hideFirstRecipient={hideRecipient}
                      disabled={isSubmitting}
                      metadataInputs={metadataInputs}
                      id={index}
                      lock={lock!}
                    />
                  </FormProvider>
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

const recipientFromConfig = (
  paywall: PaywallConfigType,
  lock: Lock | LockState | undefined
): string => {
  const paywallRecipient = paywall.recipient
  const lockRecipient = paywall?.locks[lock!.address].recipient

  if (paywallRecipient != undefined && paywallRecipient != '') {
    return paywallRecipient
  } else if (lockRecipient != undefined && lockRecipient != '') {
    return lockRecipient
  }
  return ''
}
