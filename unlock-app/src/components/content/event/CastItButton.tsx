import { SiFarcaster } from 'react-icons/si'
import { Tooltip } from '@unlock-protocol/ui'
import Link from 'next/link'
import { Metadata } from '~/components/interface/locks/metadata/utils'
import { getEventDate } from './utils'
import { config } from '~/config/app'

interface CastItButtonProps {
  event?: Partial<Metadata>
  eventUrl?: string
  eventCollection?: any
}

export const CastItButton = ({
  event,
  eventUrl,
  eventCollection,
}: CastItButtonProps) => {
  let castText = ''
  let urlToShare = ''

  if (event && eventUrl) {
    const eventDate = getEventDate(event.ticket)
    if (event.name && eventDate) {
      castText = `🎟️ I will be attending ${event.name} on ${eventDate.toLocaleDateString(
        undefined,
        {
          timeZone: event?.ticket?.event_timezone,
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      )}. Join me and get your tickets with @unlock-protocol.`
      urlToShare = eventUrl.toString()
    } else {
      return null
    }
  } else if (eventCollection) {
    const hasEvents =
      eventCollection.events && eventCollection.events.length > 0
    const firstEventName = hasEvents ? eventCollection.events[0].name : ''

    castText = hasEvents
      ? `✨ Explore the "${eventCollection.title}" collection powered by @unlock-protocol! Featuring events like "${firstEventName}". RSVP and join the community today!`
      : `✨ Discover the "${eventCollection.title}" collection powered by @unlock-protocol! Stay tuned for upcoming events and join the community.`

    castText += `\n\n${eventCollection.description}`
    urlToShare = `${config.unlockApp}/events/${eventCollection.slug}`
  } else {
    return null
  }

  const castIntent = new URL('https://warpcast.com/~/compose')
  castIntent.searchParams.set('text', `${castText}\n\n${urlToShare}`)

  return (
    <Tooltip
      delay={0}
      label="Share on Farcaster"
      tip="Share on Farcaster"
      side="bottom"
    >
      <Link
        target="_blank"
        href={castIntent.toString()}
        className="w-12 h-12 flex justify-center items-center p-2"
      >
        <SiFarcaster />
      </Link>
    </Tooltip>
  )
}

export default CastItButton
