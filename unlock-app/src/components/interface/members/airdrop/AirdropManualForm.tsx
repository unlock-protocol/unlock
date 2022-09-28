import { Button, Input } from '@unlock-protocol/ui'
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
export interface Props {
  add(member: AirdropMember): void
  lock: Lock
  list: AirdropMember[]
  defaultValues?: Partial<AirdropMember>
}

export function AirdropForm({ add, defaultValues, lock }: Props) {
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

  return (
    <form
      onSubmit={handleSubmit((member) => {
        const parsed = AirdropMember.parse(member)
        add(parsed)
        reset()
      })}
      className="grid gap-6"
    >
      <Input
        label="Recipient"
        {...register('recipient', {
          pattern: ACCOUNT_REGEXP,
          required: 'Recipient is required',
          onChange: addressFieldChanged('recipient'),
        })}
        error={errors.recipient?.message}
        description="Enter recipient address or ENS."
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
            value: lock?.maxKeysPerAddress || 1,
            message:
              "That's the max you can airdrop for this lock to a single address.",
          },
        })}
        error={errors.count?.message}
      />

      <div className="space-y-2">
        <Input
          disabled={formValues.neverExpire}
          label="Expiration"
          type="datetime-local"
          {...register('expiration')}
        />
        <div className="flex items-center gap-2 ml-1">
          <input
            id="no-expiration"
            type="checkbox"
            className="rounded text-brand-ui-primary"
            {...register('neverExpire')}
          />
          <label className="text-sm" htmlFor="no-expiration">
            No expiration
          </label>
        </div>
      </div>
      <Input
        type="email"
        label="Email Address (optional)"
        {...register('email')}
        description="Send a confirmation email to your recipient with the QR code and link for NFT."
        error={errors.email?.message}
      />
      <Input
        label="Key Manager (optional)"
        {...register('manager', {
          onChange: addressFieldChanged('manager'),
        })}
        description="Key manager will be grant the permission to transfer, cancel the membership. By default, your address is set as manager."
        error={errors.manager?.message}
      />
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
        defaultValues={{
          expiration,
          manager: account,
          neverExpire: lock.expirationDuration === -1,
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
                ToastHelper.success(`Successfully granted ${list.length} keys`)
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
