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
        } text-center p-6 rounded-t-xl`}
      >
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
        <div className="grid gap-2">
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
