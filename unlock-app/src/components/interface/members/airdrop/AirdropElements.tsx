import { IconButton } from '@unlock-protocol/ui'
import * as z from 'zod'
import { addressMinify } from '~/utils/strings'
import { RiCloseLine as CloseIcon } from 'react-icons/ri'
import { MouseEventHandler } from 'react'

export const AirdropMember = z.object({
  recipient: z.string(),
  count: z.preprocess((item) => Number(item), z.number().default(1)),
  expiration: z.preprocess((item) => {
    if (typeof item === 'string') {
      return new Date(item)
    }
  }, z.date()),
  manager: z.string().optional(),
  email: z.string().optional(),
})

export type AirdropMember = z.infer<typeof AirdropMember>

interface AirdropListItemProps {
  value: AirdropMember
  onRemove: MouseEventHandler<HTMLButtonElement>
}

export function AirdropListItem({
  value: { recipient, count },
  onRemove,
}: AirdropListItemProps) {
  return (
    <div className="flex items-center justify-between w-full px-2 py-1 text-sm bg-white rounded-lg shadow">
      <div className="space-x-2">
        <span>{addressMinify(recipient)}</span>
        <span> - </span>
        <span className="text-gray-500">
          {count} {count > 1 ? 'keys' : 'key'}
        </span>
      </div>
      <IconButton
        onClick={onRemove}
        icon={<CloseIcon size={20} className="hover:fill-inherit" />}
        label="Close"
      />
    </div>
  )
}
