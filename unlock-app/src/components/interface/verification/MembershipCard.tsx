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

interface Props {
  timestamp: number
  lock: Lock
  membershipData: any
  network: number
  invalid?: string
  checkedInAt?: string
  children: ReactNode
}

export function MembershipCard({
  lock,
  timestamp,
  network,
  membershipData,
  checkedInAt,
  invalid,
  children = null,
}: Props) {
  const timeSinceSigned = dayjs().from(timestamp, true)
  const config = useConfig()
  return (
    <div className="w-full bg-white max-w-sm rounded-xl">
      <div
        className={` ${
          invalid ? 'bg-red-500' : 'bg-green-500'
        } text-center p-6 rounded-t-xl`}
      >
        <div className="inline-flex items-center justify-center">
          {invalid ? (
            <InvalidIcon size={54} className="fill-white" />
          ) : (
            <ValidIcon size={54} className="fill-white" />
          )}
        </div>
        <p className="text-white font-bold">
          {invalid ? invalid : `Welcome to ${lock.name}`}
        </p>
      </div>
      <div className="p-6">
        <div className="flex gap-2 items-center">
          <Avatar>
            <AvatarImage
              className="flex items-center justify-center w-16 h-16 border rounded-full"
              alt={lock?.name}
              src={membershipData?.image}
              width={50}
              height={50}
            />
            <AvatarFallback className="flex items-center uppercase justify-center w-20 h-20 border rounded-full">
              {lock?.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium"> {lock.name} </h3>
            <Item label="ID" value={membershipData.keyId.toString()} />
          </div>
        </div>
        <div className="grid gap-2 py-6">
          <Item label="Lock Address" value={addressMinify(lock.address)} />
          <Item label="Network" value={config.networks[network].name} />
          <Item label="Time since signed" value={timeSinceSigned} />
          {checkedInAt && (
            <Item
              label="Checked in at"
              value={new Date(checkedInAt).toLocaleDateString()}
            />
          )}
          <Item
            label="Owner"
            value={addressMinify(membershipData.owner.toString())}
          />
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
