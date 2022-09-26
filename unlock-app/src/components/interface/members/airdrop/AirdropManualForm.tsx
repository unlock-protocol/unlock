import { Button, Input } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'
import { getAddressForName } from '~/hooks/useEns'
import { ACCOUNT_REGEXP } from '~/constants'
import { useState } from 'react'
import { AirdropMember } from './AirdropElements'
import { useList } from 'react-use'
import { AirdropListItem } from './AirdropElements'

export interface Props {
  add(member: AirdropMember): void
  list: AirdropMember[]
  defaultValues?: Partial<AirdropMember>
}

export function AirdropForm({ add, defaultValues }: Props) {
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AirdropMember>({
    defaultValues,
  })

  const [customExpiration, setCustomExpiration] = useState(true)

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
      />
      <Input
        pattern="[0-9]+"
        label="Number of keys to airdrop"
        {...register('count', {
          valueAsNumber: true,
        })}
        error={errors.count?.message}
      />

      <div className="space-y-2">
        <Input
          disabled={!customExpiration}
          label="Expiration"
          type="date"
          {...register('expiration', {
            valueAsDate: true,
          })}
        />
        <div className="flex items-center gap-2 ml-1">
          <input
            id="no-expiration"
            type="checkbox"
            className="rounded text-brand-ui-primary"
            onChange={(event) => {
              setCustomExpiration(!event.target.checked)
            }}
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
  onConfirm(members: AirdropMember[]): void | Promise<void>
}

export function AirdropManualForm({ onConfirm }: AirdropManualFormProps) {
  const [list, { push, removeAt }] = useList<AirdropMember>([])
  return (
    <div className="space-y-6 overflow-y-auto">
      <AirdropForm
        add={(member) => push(member)}
        list={list}
        defaultValues={{}}
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
            onClick={(event) => {
              event.preventDefault()
              onConfirm(list)
            }}
          >
            Confirm Airdrop
          </Button>
        </div>
      )}
    </div>
  )
}
