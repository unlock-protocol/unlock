import Link from 'next/link'
import { FiExternalLink as ExternalLinkIcon } from 'react-icons/fi'
import { Metadata } from '~/components/interface/locks/metadata/utils'
import { EventDetail } from './EventDetail'
import { FiMapPin as MapPinIcon } from 'react-icons/fi'
import { BiLogoZoom as ZoomIcon } from 'react-icons/bi'

interface EventLocationProps {
  event?: Partial<Metadata>
  inPerson?: boolean
  eventLocation?: string
  eventAddress?: string
  backgroundColor?: string
  compact?: boolean
}

export const EventLocation = ({
  event,
  inPerson,
  eventLocation,
  eventAddress,
  backgroundColor,
  compact = false,
}: EventLocationProps) => {
  const isInPerson = inPerson ?? event?.ticket?.event_is_in_person
  const location = eventLocation ?? event?.ticket?.event_location
  const address = eventAddress ?? event?.ticket?.event_address
  const bgColor = backgroundColor ?? event?.background_color

  return (
    <EventDetail
      label="Location"
      icon={isInPerson ? MapPinIcon : ZoomIcon}
      compact={compact}
    >
      <div style={{ color: `#${bgColor}` }} className="flex flex-col gap-0.5">
        {isInPerson && (
          <>
            <span
              className={`${compact ? 'text-sm' : 'text-lg'} font-normal capitalize text-brand-dark`}
            >
              {location || address}
            </span>
            {address && (
              <Link
                target="_blank"
                className={`${compact ? 'text-xs' : 'text-base'} font-bold`}
                href={`https://www.google.com/maps/search/?api=1&query=${address}`}
              >
                Show map
              </Link>
            )}
          </>
        )}
        {!isInPerson && address && (
          <Link
            target="_blank"
            className={`${compact ? 'text-xs' : 'text-base'} flex items-center gap-2 hover:text-brand-ui-primary`}
            href={address}
          >
            Open video-conference <ExternalLinkIcon />
          </Link>
        )}
      </div>
    </EventDetail>
  )
}
