import { Button, Input, ToggleSwitch, Toggle } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'
import { getAddressForName } from '~/hooks/useEns'
import { ACCOUNT_REGEXP } from '~/constants'
import { AirdropMember } from './AirdropElements'
import { useList } from 'react-use'
import { AirdropListItem } from './AirdropElements'
import { Lock } from '~/unlockTypes'
import { useAuth } from '~/contexts/AuthenticationContext'
import { formatDate } from '~/utils/lock'
import { useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { KeyManager } from '@unlock-protocol/unlock-js'
import { useConfig } from '~/utils/withConfig'
export interface Props {
  add(member: AirdropMember): void
  lock: Lock
  list: AirdropMember[]
  isEmailAirdrop: boolean
  setIsEmailAirdrop(value: boolean): void
  defaultValues?: Partial<AirdropMember>
}

export function AirdropForm({
  add,
  defaultValues,
  lock,
  isEmailAirdrop,
  setIsEmailAirdrop,
}: Props) {
  const config = useConfig()
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AirdropMember>({
    defaultValues,
  })

  const formValues = watch()

  const addressFieldChanged = (name: keyof AirdropMember) => {
    return async (event: React.ChangeEvent<HTMLInputElement>) => {
      const address = await getAddressForName(event.target.value)
      if (address) {
        return setValue(name, address, {
          shouldValidate: true,
          shouldDirty: true,
        })
      }
    }
  }

  const maxKeysPerAddress = lock?.maxKeysPerAddress || 1

  return (
    <form
      onSubmit={handleSubmit((member) => {
        if (!member.recipient && member.email) {
          const keyManager = new KeyManager(config.networks)
          const networkConfig = config.networks[lock.network]
          const recipient = keyManager.createTransferAddress({
            params: {
              email: member.email,
              lockAddress: lock.address,
            },
          })
          member.manager = networkConfig.keyManagerAddress
          member.recipient = recipient
        }
        const parsed = AirdropMember.parse(member)
        add(parsed)
        reset()
      })}
      className="grid gap-6"
    >
      <div className="p-4 bg-white border border-gray-200 rounded-xl">
        <div className="flex items-center justify-between">
          <label htmlFor="email-toggle">
            I don&apos;t have wallet address or ENS
          </label>
          <div>
            <Toggle
              value={isEmailAirdrop}
              aria-label="email-toggle"
              onChange={(value) => {
                setIsEmailAirdrop(value)
              }}
            />
          </div>
        </div>
      </div>

      {!isEmailAirdrop && (
        <Input
          disabled={isEmailAirdrop}
          label="Wallet"
          {...register('recipient', {
            disabled: isEmailAirdrop,
            pattern: ACCOUNT_REGEXP,
            required: 'Wallet address or ENS is required',
            onChange: addressFieldChanged('recipient'),
          })}
          error={errors.recipient?.message}
          description="Enter wallet address or ENS."
        />
      )}

      <Input
        type="email"
        label="Email Address"
        {...register('email', {
          required: {
            value: isEmailAirdrop,
            message: 'Email is required',
          },
        })}
        description={
          isEmailAirdrop
            ? 'A confirmation email will sent to your recipient with the QR code and a link to claim the NFT to their own wallet.'
            : 'A confirmation email will be sent to your recipient with the QR code and link for NFT.'
        }
        error={errors.email?.message}
      />
      <Input
        pattern="[0-9]+"
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
            onChange={(enabled) => {
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
      {!isEmailAirdrop && (
        <Input
          label="Key Manager"
          {...register('manager', {
            onChange: addressFieldChanged('manager'),
          })}
          description="Key manager will be grant the permission to transfer, cancel the membership. By default, your address is set as manager."
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
}

export function AirdropManualForm({ onConfirm, lock }: AirdropManualFormProps) {
  const [isEmailAirdrop, setIsEmailAirdrop] = useState(false)
  const [list, { push, removeAt, clear }] = useList<AirdropMember>([])
  const { account } = useAuth()
  const expiration = formatDate(lock.expirationDuration || 0)
  const [isConfirming, setIsConfirming] = useState(false)

  return (
    <div className="space-y-6 overflow-y-auto">
      <AirdropForm
        lock={lock}
        add={(member) => push(member)}
        list={list}
        isEmailAirdrop={isEmailAirdrop}
        setIsEmailAirdrop={setIsEmailAirdrop}
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
            onClick={async (event) => {
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
