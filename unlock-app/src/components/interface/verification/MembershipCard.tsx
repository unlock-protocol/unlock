import {
  AvatarImage,
  Fallback as AvatarFallback,
  Root as Avatar,
} from '@radix-ui/react-avatar'
import { Lock } from '~/unlockTypes'
import dayjs from 'dayjs'
import relativeTimePlugin from 'dayjs/plugin/relativeTime'
import { addressMinify } from '~/utils/strings'
import { useConfig } from '~/utils/withConfig'
import {
  RiCloseCircleFill as InvalidIcon,
  RiCheckboxCircleFill as ValidIcon,
} from 'react-icons/ri'
import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { RiCloseLine as CloseIcon } from 'react-icons/ri'

dayjs.extend(relativeTimePlugin)

export interface MembershipData {
  expiration: number
  image: string
  keyId: string | number
  owner: string
  userMetadata?: {
    public?: Record<string, string>
    protected?: Record<string, string>
  }
  network: number
  metadata?: Record<string, string>
  lockAddress: number
  attributes: Record<string, string>[]
}

interface Props {
  timestamp: number
  lock: Lock
  membershipData: MembershipData
  network: number
  invalid?: string
  checkedInAt?: string
  owner: string
  keyId: string
  children?: ReactNode
  onClose?: () => void
}

export function MembershipCard({
  lock,
  timestamp,
  network,
  membershipData,
  checkedInAt,
  invalid,
  owner,
  keyId,
  onClose,
  children = null,
}: Props) {
  const timeSinceSigned = dayjs().from(timestamp, true)
  const timeSinceCheckedIn = dayjs().from(checkedInAt, true)
  const config = useConfig()

  return (
    <div className="w-full bg-white max-w-sm rounded-xl">
      <div
        className={` ${
          invalid ? 'bg-red-500' : checkedInAt ? 'bg-amber-300' : 'bg-green-500'
        }   rounded-t-xl`}
      >
        <div className="flex justify-end items-center">
          {onClose && (
            <button
              onClick={(event) => {
                event.preventDefault()
                onClose()
              }}
              className="flex items-center justify-center p-2  rounded group"
              aria-label="Close"
            >
              <CloseIcon
                className="fill-white group-hover:fill-brand-ui-primary"
                size={24}
                key="close"
              />
            </button>
          )}
        </div>
        <div className="text-center p-6">
          <div className="inline-flex items-center justify-center">
            {invalid ? (
              <InvalidIcon size={54} className="fill-white" />
            ) : (
              <ValidIcon size={54} className="fill-white" />
            )}
          </div>
          <p className="text-white font-bold text-xl">
            {invalid
              ? invalid
              : checkedInAt
              ? `Checked-in ${timeSinceCheckedIn} ago`
              : `${lock.name}`}
          </p>
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex gap-6 items-center">
          <Avatar>
            <AvatarImage
              className="flex items-center justify-center w-16 h-16 rounded-full"
              alt={lock?.name}
              src={membershipData?.image}
              width={50}
              height={50}
            />
            <AvatarFallback className="flex items-center uppercase justify-center w-20 h-20 rounded-full">
              {lock?.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <h3 className="font-medium"> {lock.name} </h3>
            <Item label="ID" value={keyId} />
          </div>
        </div>
        <div className="space-y-2">
          <EthCCBadge lockAddress={lock.address} />
          <Item label="Lock Address" value={addressMinify(lock.address)} />
          <Item label="Network" value={config.networks[network].name} />
          <Item label="Time since signed" value={timeSinceSigned} />
          <Item label="Owner" value={addressMinify(owner)} />
          {!!membershipData?.userMetadata?.public && (
            <MetadataItems metadata={membershipData.userMetadata.public} />
          )}
          {!!membershipData?.userMetadata?.protected && (
            <MetadataItems metadata={membershipData.userMetadata.protected} />
          )}
        </div>
        {children}
      </div>
    </div>
  )
}

interface ItemProps {
  label: string
  value: string
}

export function Item({ label, value }: ItemProps) {
  return (
    <div className="flex gap-2 items-center">
      <span className="text-gray-500"> {label}: </span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

export function MetadataItems({
  metadata,
}: {
  metadata: Record<string, string>
}) {
  return (
    <>
      {Object.entries(metadata).map(([name, value]) => (
        <Item label={name} value={value} key={name} />
      ))}
    </>
  )
}

export function MembershipCardPlaceholder() {
  return (
    <div className="w-full bg-white max-w-sm rounded-xl">
      <div className="rounded-t-xl bg-gray-100 h-32"></div>
      <div className="p-6 space-y-6">
        <div className="flex gap-6 items-center flex-wrap">
          <div className="flex bg-gray-50 items-center animate-pulse uppercase justify-center w-20 h-20 rounded-full"></div>
        </div>
        <div className="grid gap-2">
          <div className="bg-gray-50 animate-pulse h-6 w-full rounded-xl"></div>
          <div className="bg-gray-50 animate-pulse h-6 w-full rounded-xl"></div>
          <div className="bg-gray-50 animate-pulse h-6 w-full rounded-xl"></div>
          <div className="bg-gray-50 animate-pulse h-6 w-full rounded-xl"></div>
          <div className="bg-gray-50 animate-pulse h-6 w-full rounded-xl"></div>
        </div>
        <div className="bg-gray-50 animate-pulse h-12 w-full rounded-full"></div>
      </div>
    </div>
  )
}

interface EthCCBadgeProps {
  lockAddress: string
}

const ETHCC_BADGES: Record<string, Record<'title' | 'class', string>> = {
  white: {
    title: 'Attendee',
    class: 'bg-zinc-50 border-zinc-200',
  },
  blue: {
    title: 'Sponsor',
    class: 'bg-blue-300 text-blue-900',
  },
  green: {
    title: 'Press',
    class: 'bg-green-300 text-green-900',
  },
  purple: {
    title: 'Staff',
    class: 'bg-purple-300 text-purple-900',
  },
}

const ETHCC_LOCK_BADGE: Record<'address' | 'label', string>[] = [
  {
    address: '0xd0A031d9f9486B1D914124D0C1FCAC2e9e6504FE',
    label: 'white',
  },
  {
    address: '0x072149617e12170696481684598a696e9a4d46Ff',
    label: 'white',
  },
  {
    address: '0x9AB351cB5DAe55abD135dD256726851aae8EFeB5',
    label: 'white',
  },
  {
    address: '0xF181e18e007517605f369EccF0eeE6EBb1B10133',
    label: 'white',
  },
  {
    address: '0x6d8C3D90340fa33693a88D1411b0F32Df12D0683',
    label: 'blue',
  },
  {
    address: '0xF99eb828aC365C54FCbb6779a78417c25f113829',
    label: 'green',
  },
  {
    address: '0x623dA3e4D4CB9C98DABb4C23789ed5AaA20Ea3aA',
    label: 'purple',
  },
  {
    address: '0x4624Bbf6d685B1057eEcAcC691B0a068E287F0a5',
    label: 'purple',
  },
]

export function EthCCBadge({ lockAddress }: EthCCBadgeProps) {
  const badgeLabel = ETHCC_LOCK_BADGE.find(
    (item) => item.address.toLowerCase() === lockAddress.toLowerCase()
  )?.label

  if (!badgeLabel) {
    return null
  }
  const badge = ETHCC_BADGES[badgeLabel]
  const badgeClass = twMerge(
    'px-4 py-0.5 inline-flex border border-transparent rounded-full font-bold',
    badge.class
  )
  return <div className={badgeClass}>{badge.title}</div>
}
