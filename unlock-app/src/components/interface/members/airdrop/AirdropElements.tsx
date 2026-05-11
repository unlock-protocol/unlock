import { IconButton } from '@unlock-protocol/ui'
import * as z from 'zod'
import { addressMinify } from '~/utils/strings'
import { RiCloseLine as CloseIcon } from 'react-icons/ri'
import { MouseEventHandler } from 'react'

export const AirdropMember = z
  .object({
    wallet: z.string(),
    count: z.preprocess((item) => Number(item), z.number().default(1)),
    expiration: z.string().optional(),
    neverExpire: z.preprocess(
      (value) => !!value,
      z.boolean().optional().default(false)
    ),
    manager: z.string().optional(),
    email: z.string().optional(),
    balance: z.number().optional(),
    line: z.number().optional(),
  })
  .passthrough()

export type AirdropMember = z.infer<typeof AirdropMember>

interface AirdropListItemProps {
  value: AirdropMember
  onRemove: MouseEventHandler<HTMLButtonElement>
}

const memberFields = new Set([
  'balance',
  'count',
  'email',
  'expiration',
  'line',
  'manager',
  'neverExpire',
  'wallet',
])

const formatMetadataField = (key: string) => {
  const [name, designation] = key.split('.')
  return designation === 'public' ? `${name} (public)` : name
}

export function AirdropListItem({ value, onRemove }: AirdropListItemProps) {
  const { wallet, count, email, expiration, neverExpire } = value
  const metadataItems = Object.entries(value).filter(([key, item]) => {
    return !memberFields.has(key) && item !== undefined && item !== ''
  })

  return (
    <div className="flex items-center justify-between w-full px-2 py-1 text-sm bg-white rounded-lg shadow">
      <div className="space-y-1">
        <span>
          {addressMinify(wallet)} {email ? `(${email})` : ''}{' '}
        </span>
        <span className="block text-gray-500">
          {count} {count > 1 ? 'keys' : 'key'}{' '}
          {expiration &&
            `valid until ${new Date(expiration).toLocaleDateString()}`}
          {neverExpire && 'never expires'}
        </span>
        {metadataItems.length > 0 && (
          <span className="block text-gray-500">
            {metadataItems
              .map(([key, item]) => `${formatMetadataField(key)}: ${item}`)
              .join(', ')}
          </span>
        )}
      </div>
      <IconButton
        onClick={onRemove}
        icon={<CloseIcon size={20} className="hover:fill-inherit" />}
        label="Close"
      />
    </div>
  )
}
