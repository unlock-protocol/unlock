import { ReactNode } from 'react'
import UnlockAssets from '@unlock-protocol/unlock-assets'
import {
  RiCalendarLine as DateIcon,
  RiTimer2Line as TimeIcon,
  RiMapPinLine as LocationIcon,
} from 'react-icons/ri'
import { networks } from '@unlock-protocol/networks'
import { minifyAddress } from '~/utils'
const { SvgComponents } = UnlockAssets

interface Props {
  id: string
  recipient: string
  title: string
  iconURL: string
  items?: ReactNode[]
  location?: string
  time?: string
  date?: string
  lockAddress: string
  network: number
  QRCodeURL: string
}

export function Ticket({
  iconURL,
  title,
  items,
  recipient,
  id,
  QRCodeURL,
  date,
  time,
  location,
  lockAddress,
  network,
}: Props) {
  const networkConfig = networks[network]
  return (
    <div className="flex flex-col max-w-sm">
      <div className="p-6 space-y-6 bg-white rounded-3xl">
        <div className="flex gap-6">
          <img
            width={64}
            height={64}
            src={iconURL}
            className="w-16 h-16 overflow-hidden rounded-xl aspect-1"
            alt={title}
          />
          <h3 className="text-xl font-bold sm:text-2xl"> {title}</h3>
        </div>
        <div className="space-y-2">
          {date && <TicketItem icon={<DateIcon />} value={date} />}
          {time && <TicketItem icon={<TimeIcon />} value={time} />}
          {location && <TicketItem icon={<LocationIcon />} value={location} />}
          {items}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TicketLabel label="Token ID" value={id} />
          <TicketLabel label="Recipient" value={minifyAddress(recipient)} />
          <TicketLabel label="Network" value={networkConfig.name} />
          <TicketLabel
            label="Lock Address"
            value={minifyAddress(lockAddress)}
          />
        </div>
      </div>
      <div className="p-6 bg-white border-t-2 border-dashed rounded-3xl">
        <img src={QRCodeURL} alt="" />
        <div className="flex items-center justify-center gap-1 text-xs">
          Powered by <SvgComponents.UnlockWordMark width={56} />
        </div>
      </div>
    </div>
  )
}

interface TicketLabelProps {
  label: string
  value: string
}

export function TicketLabel({ label, value }: TicketLabelProps) {
  return (
    <div className="flex-col space-y-1">
      <div className="text-sm text-brand-dark">{label}</div>
      <div className="text-lg font-semibold text-brand-dark">{value}</div>
    </div>
  )
}

interface TicketItemProps {
  icon: ReactNode
  value: string
}

export function TicketItem({ icon, value }: TicketItemProps) {
  return (
    <div className="flex items-center gap-2">
      <div>{icon}</div>
      <div className="text-base font-bold text-brand-dark">{value}</div>
    </div>
  )
}
