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
import { useAuth } from '~/contexts/AuthenticationContext'
import { formatDate } from '~/utils/lock'
import { ChangeEvent, useCallback, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { KeyManager } from '@unlock-protocol/unlock-js'
import { useConfig } from '~/utils/withConfig'
import { twMerge } from 'tailwind-merge'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { onResolveName } from '~/utils/resolvers'
export interface Props {
  add(member: AirdropMember): void
  lock: Lock
  list: AirdropMember[]
  defaultValues?: Partial<AirdropMember>
  emailRequired?: boolean
}

export function AirdropForm({
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
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AirdropMember>({
    // @ts-expect-error
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
    ? 'Enter the email address that will receive the membership NFT'
    : 'Enter the wallet address or an ENS that will receive the membership NFT'
  const error = errors?.wallet?.message
  const placeholder = useEmail ? 'user@email.com' : '0x...'
  const inputClass = twMerge(
    'box-border flex-1 block w-full transition-all border pl-4 py-2 text-base border-gray-400 rounded-lg shadow-sm hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none disabled:bg-gray-100',
    error &&
      'border-brand-secondary hover:border-brand-secondary focus:border-brand-secondary focus:ring-brand-secondary'
  )

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
      const address = await getAddressForName(member.wallet)
      member.wallet = address
      const parsed = AirdropMember.parse(member)
      add(parsed)
      reset()
      setValue('wallet', '')
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
                return '' // error already handle by the component
              }
            },
          },
        }}
        render={({ field: { onChange, ref, onBlur } }) => {
          return (
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-base" htmlFor={label}>
                  {label}
                </label>
                <div className="flex items-center gap-2">
                  <div className="text-base">No wallet address?</div>
                  <Toggle
                    value={useEmail}
                    onChange={(value: boolean) => {
                      setUseEmail(value)
                    }}
                  />
                </div>
              </div>
              {useEmail ? (
                <input
                  className={inputClass}
                  placeholder={placeholder}
                  name={label}
                  id={label}
                  type="email"
                  onChange={(event) => {
                    onChange(onWalletChange(event))
                  }}
                  ref={ref}
                  onBlur={onBlur}
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
                      <>
                        <AddressInput
                          withIcon
                          value={wallet}
                          onChange={(value: any) => {
                            setValue('wallet', value)
                          }}
                          onResolveName={onResolveName}
                        />
                      </>
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
          description={
            'A confirmation email will be sent to your recipient with the QR code and link for NFT.'
          }
          error={errors.email?.message}
        />
      )}
      <Input
        pattern="\d+"
        label="Number of keys to airdrop"
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span>Expiration</span>
          <ToggleSwitch
            enabled={formValues.neverExpire}
            setEnabled={() => setValue('neverExpire', !formValues.neverExpire)}
            onChange={(enabled: boolean) => {
              if (enabled) {
                setValue('expiration', undefined)
              }
            }}
            title="Never expires"
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
  const { account } = useAuth()
  const expiration = new Date(
    formatDate(lock.expirationDuration || 0)
  ).getTime()
  const [isConfirming, setIsConfirming] = useState(false)

  return (
    <div className="space-y-6 overflow-y-auto">
      <AirdropForm
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
