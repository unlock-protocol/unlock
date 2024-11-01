import Link from 'next/link'
import { FiExternalLink as ExternalLinkIcon } from 'react-icons/fi'
import { Metadata } from '~/components/interface/locks/metadata/utils'
import { EventDetail } from './EventDetail'
import { FiMapPin as MapPinIcon } from 'react-icons/fi'
import { BiLogoZoom as ZoomIcon } from 'react-icons/bi'

export const EventLocation = ({
  event,
  compact,
}: {
  event: Partial<Metadata>
  compact?: boolean
}) => {
  const inPerson = event.ticket?.event_is_in_person

  return (
    <EventDetail
      label="Location"
      icon={inPerson ? MapPinIcon : ZoomIcon}
      compact={compact}
    >
      <div
        style={{ color: `#${event.background_color}` }}
        className="flex flex-col gap-0.5"
      >
        {inPerson && (
          <>
            <span
              className={`font-normal capitalize text-brand-dark ${compact ? 'text-base' : 'text-lg'}`}
            >
              {event.ticket?.event_location
                ? event.ticket.event_location
                : event.ticket?.event_address}
            </span>
            <Link
              target="_blank"
              className={`font-bold ${compact ? 'text-sm text-brand-ui-primary' : 'text-base'}`}
              href={`https://www.google.com/maps/search/?api=1&query=${event.ticket?.event_address}`}
            >
              Show map
            </Link>
          </>
        )}
        {!inPerson && (
          <Link
            target="_blank"
            className={`flex items-center gap-2 hover:text-brand-ui-primary ${compact ? 'text-sm' : 'text-base'}`}
            href={event.ticket?.event_address}
          >
            Open video-conference <ExternalLinkIcon />
          </Link>
        )}
      </div>
    </EventDetail>
  )
}
