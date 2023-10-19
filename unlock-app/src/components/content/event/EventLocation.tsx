import Link from 'next/link'
import { FiExternalLink as ExternalLinkIcon } from 'react-icons/fi'
import { Metadata } from '~/components/interface/locks/metadata/utils'
import { EventDetail } from './EventDetail'
import { FiMapPin as MapPinIcon } from 'react-icons/fi'
import { BiLogoZoom as ZoomIcon } from 'react-icons/bi'

export const EventLocation = ({
  eventData,
}: {
  eventData: Partial<Metadata>
}) => {
  let inPerson = true
  if (eventData.ticket?.event_address.startsWith('http')) {
    inPerson = false
  }
  return (
    <EventDetail label="Location" icon={inPerson ? MapPinIcon : ZoomIcon}>
      <div
        style={{ color: `#${eventData.background_color}` }}
        className="flex flex-col gap-0.5"
      >
        {inPerson && (
          <>
            <span className="text-lg font-normal capitalize text-brand-dark">
              {eventData.ticket?.event_address}
            </span>
            <Link
              target="_blank"
              className="text-base font-bold"
              href={`https://www.google.com/maps/search/?api=1&query=${eventData.ticket?.event_address}`}
            >
              Show map
            </Link>
          </>
        )}
        {!inPerson && (
          <Link
            target="_blank"
            className="text-base flex items-center gap-2 hover:text-brand-ui-primary"
            href={eventData.ticket?.event_address}
          >
            Open video-conference <ExternalLinkIcon />
          </Link>
        )}
      </div>
    </EventDetail>
  )
}
