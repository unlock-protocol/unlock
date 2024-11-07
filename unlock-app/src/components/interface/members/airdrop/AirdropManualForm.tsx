import {
  Button,
  Input,
  ToggleSwitch,
  Toggle,
  AddressInput,
} from '@unlock-protocol/ui'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { getAddressForName } from '~/hooks/useEns'
import { AirdropMember } from './AirdropElements'
import { useList } from 'react-use'
import { AirdropListItem } from './AirdropElements'
import { Lock } from '~/unlockTypes'
import { formatDate } from '~/utils/lock'
import { ChangeEvent, useCallback, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { KeyManager } from '@unlock-protocol/unlock-js'
import { useConfig } from '~/utils/withConfig'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { onResolveName } from '~/utils/resolvers'
import { useAuthenticate } from '~/hooks/useAuthenticate'

export interface Props {
  add(member: AirdropMember): void
  lock: Lock
  list: AirdropMember[]
  defaultValues?: Partial<AirdropMember>
  emailRequired?: boolean
}

export function AirdropInternalForm({
  add,
  defaultValues,
  lock,
  emailRequired = false,
}: Props) {
  const config = useConfig()
  const [useEmail, setUseEmail] = useState(false)
  const {
    handleSubmit,
    register,
    reset,
    resetField,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AirdropMember>({
    defaultValues,
    mode: 'onSubmit',
  })

  const formValues = watch()
  const { wallet } = useWatch({
    control,
  })

  const addressFieldChanged = (name: keyof AirdropMember) => {
    return async (event: React.ChangeEvent<HTMLInputElement>) => {
      const address = await getAddressForName(event.target.value)
      if (address) {
        return setValue(name as string, address, {
          shouldValidate: true,
          shouldDirty: true,
        })
      }
    }
  }

  const required = useEmail ? 'Email is required' : 'Wallet address is required'
  const label = useEmail ? 'Email' : 'Wallet address'

  const description = useEmail
    ? 'Enter the email address that will receive the NFT'
    : 'Enter the wallet address or an ENS that will receive the NFT'
  const error = errors?.wallet?.message
  const placeholder = useEmail ? 'user@email.com' : '0x...'

  const maxKeysPerAddress = lock?.maxKeysPerAddress || 1
  const web3Service = useWeb3Service()
  const networkConfig = config.networks[lock.network]

  const onWalletChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      if (useEmail && networkConfig.keyManagerAddress) {
        const keyManager = new KeyManager(config.networks)
        const address = keyManager.createTransferAddress({
          params: {
            email: event.target.value,
            lockAddress: lock!.address,
          },
        })
        setValue('email', value)
        setValue('manager', networkConfig.keyManagerAddress)
        return address
      }
      return value
    },
    [setValue, useEmail, lock, config.networks, networkConfig]
  )

  const onSubmitHandler = useCallback(
    async (member: AirdropMember) => {
      try {
        const address = await getAddressForName(member.wallet)
        member.wallet = address
        const parsed = AirdropMember.parse(member)
        add(parsed)
        reset()
        setValue('wallet', '')
      } catch (error) {
        ToastHelper.error("There was an error with the member's info. ")
        console.error(error)
      }
    },
    [add, reset, setValue]
  )

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="grid gap-6">
      <Controller
        name="wallet"
        control={control}
        rules={{
          required,
          validate: {
            max_keys: async (address: string) => {
              if (!address) {
                return true
              }

              try {
                const numberOfMemberships = await web3Service.totalKeys(
                  lock!.address,
                  address,
                  lock!.network
                )
                return numberOfMemberships < (lock?.maxKeysPerAddress || 1)
                  ? true
                  : 'Address already holds the maximum number of memberships.'
              } catch (error) {
                console.error(error)
                return '' // error already handle by the component
              }
            },
          },
        }}
        render={({ field: { onChange, ref, onBlur } }) => {
          return (
            <div className="grid">
              <div className="flex items-center justify-between mb-1">
                <label className="text-base" htmlFor={label}>
                  {label}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-base">No wallet address?</span>
                  <Toggle
                    size="small"
                    disabled={!networkConfig.keyManagerAddress}
                    value={useEmail}
                    onChange={(value: boolean) => {
                      if (value && !networkConfig.keyManagerAddress) {
                        ToastHelper.error(
                          'Email airdrops are disabled for this network.'
                        )
                        return
                      }

                      resetField('email')
                      resetField('wallet')
                      setUseEmail(value)
                    }}
                  />
                </div>
              </div>
              {useEmail ? (
                <Input
                  placeholder={placeholder}
                  name={label}
                  type="email"
                  ref={ref}
                  onBlur={onBlur}
                  onChange={(event) => {
                    onChange(onWalletChange(event))
                  }}
                />
              ) : (
                <Controller
                  name="wallet"
                  control={control}
                  rules={{
                    required: true,
                  }}
                  render={() => {
                    return (
                      <AddressInput
                        withIcon
                        value={wallet}
                        onChange={(value: any) => {
                          setValue('wallet', value)
                        }}
                        required
                        onResolveName={onResolveName}
                      />
                    )
                  }}
                />
              )}
              {description && !error && (
                <p className="text-sm text-gray-600"> {description} </p>
              )}
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          )
        }}
      />
      {!useEmail && (
        <Input
          type="email"
          label="Email Address"
          {...register('email', {
            required: {
              value: useEmail || emailRequired,
              message: 'Email is required',
            },
          })}
          description={'A confirmation email will be sent to the recipient.'}
          error={errors.email?.message}
        />
      )}
      <div className="flex flex-row gap-4 w-full">
        <Input
          pattern="\d+"
          label="Number of keys"
          {...register('count', {
            valueAsNumber: true,
            validate: (item) => {
              if (!Number.isInteger(item)) {
                return 'Only positive numbers are allowed.'
              }
            },
            max: {
              value: maxKeysPerAddress,
              message: `Your lock currently has a maximum of keys per address set to ${maxKeysPerAddress}.`,
            },
          })}
          error={errors.count?.message}
        />

        <div className="grow">
          <div className="flex items-center justify-between">
            <span>Expiration</span>
            <ToggleSwitch
              size="small"
              enabled={formValues.neverExpire}
              setEnabled={() =>
                setValue('neverExpire', !formValues.neverExpire)
              }
              onChange={(enabled: boolean) => {
                if (enabled) {
                  setValue('expiration', undefined)
                }
              }}
              title="Never"
            />
          </div>
          <div className="relative">
            <Input
              disabled={formValues.neverExpire}
              label=""
              type="datetime-local"
              required={!formValues.neverExpire}
              {...register('expiration')}
            />
            {errors?.expiration && (
              <span className="absolute text-xs text-red-700">
                This field is required
              </span>
            )}
          </div>
        </div>
      </div>

      {!useEmail && (
        <Input
          label="Key Manager"
          {...register('manager', {
            onChange: addressFieldChanged('manager'),
          })}
          description="Key manager will be granted the permission to transfer or to cancel the membership. By default, your address is set as manager."
          error={errors.manager?.message}
        />
      )}

      <Button loading={isSubmitting} disabled={isSubmitting} type="submit">
        Add recipient
      </Button>
    </form>
  )
}

interface AirdropManualFormProps {
  lock: Lock
  onConfirm(members: AirdropMember[]): void | Promise<void>
  emailRequired?: boolean
}

export function AirdropManualForm({
  onConfirm,
  lock,
  emailRequired = false,
}: AirdropManualFormProps) {
  const [list, { push, removeAt, clear }] = useList<AirdropMember>([])
  const { account } = useAuthenticate()
  const expiration =
    lock.expirationDuration > 0
      ? new Date(formatDate(lock.expirationDuration || 0))
          .toISOString()
          .substring(0, 16)
      : undefined
  const [isConfirming, setIsConfirming] = useState(false)

  return (
    <div className="space-y-6 overflow-y-auto">
      <AirdropInternalForm
        emailRequired={emailRequired}
        lock={lock}
        add={(member) => push(member)}
        list={list}
        defaultValues={{
          expiration,
          manager: account,
          neverExpire: lock.expirationDuration === -1,
          count: 1,
        }}
      />
      {list.length > 0 && (
        <div className="grid gap-6">
          <div className="p-2 space-y-2">
            {list.map((value, index) => (
              <AirdropListItem
                key={index}
                value={value}
                onRemove={(event) => {
                  event.preventDefault()
                  removeAt(index)
                }}
              />
            ))}
          </div>
          <Button
            loading={isConfirming}
            disabled={isConfirming}
            onClick={async (event: any) => {
              event.preventDefault()
              setIsConfirming(true)
              try {
                await onConfirm(list)
                clear()
              } catch (error) {
                console.error(error)
                if (error instanceof Error) {
                  ToastHelper.error(error.message)
                }
              }
              setIsConfirming(false)
            }}
          >
            Confirm Airdrop
          </Button>
        </div>
      )}
    </div>
  )
}
