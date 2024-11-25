import { Tooltip } from '@unlock-protocol/ui'
import Link from 'next/link'
import { Metadata } from '~/components/interface/locks/metadata/utils'
import { getEventDate } from './utils'
import { config } from '~/config/app'
import { SiX as XIcon } from 'react-icons/si'

interface TweetItButtonProps {
  event?: Partial<Metadata>
  eventUrl?: string
  eventCollection?: any
}

export const TweetItButton = ({
  event,
  eventUrl,
  eventCollection,
}: TweetItButtonProps) => {
  let tweetText = ''
  let urlToShare = ''

  if (event && eventUrl) {
    const eventDate = getEventDate(event.ticket)
    if (event.name && eventDate) {
      tweetText = `🎟️ I'm attending ${event.name} on ${eventDate.toLocaleDateString(
        undefined,
        {
          timeZone: event?.ticket?.event_timezone,
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      )}! Join me and get your tickets with @unlockProtocol. 🚀`
      urlToShare = eventUrl.toString()
    } else {
      return null
    }
  } else if (eventCollection) {
    const hasEvents =
      eventCollection.events && eventCollection.events.length > 0
    const firstEventName = hasEvents ? eventCollection.events[0].name : ''

    tweetText = hasEvents
      ? `✨ Explore the "${eventCollection.title}" collection powered by @UnlockProtocol! Featuring events like "${firstEventName}". RSVP and join the community today! 🌐`
      : `✨ Discover the "${eventCollection.title}" collection powered by @UnlockProtocol! Stay tuned for upcoming events and join the community. 🌐`

    tweetText += `\n\n${eventCollection.description}`
    urlToShare = `${config.unlockApp}/events/${eventCollection.slug}`
  } else {
    return null
  }

  const tweetIntent = new URL('https://twitter.com/intent/tweet')
  tweetIntent.searchParams.set('text', tweetText)
  tweetIntent.searchParams.set('url', urlToShare)

  return (
    <Tooltip delay={0} label="Share on X" tip="Share on X" side="bottom">
      <Link
        target="_blank"
        href={tweetIntent.toString()}
        className="w-12 h-12 flex justify-center items-center"
      >
        <XIcon className="w-4 h-4" />
      </Link>
    </Tooltip>
  )
}

export default TweetItButton
