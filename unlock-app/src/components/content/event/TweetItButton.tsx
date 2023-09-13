import { Tooltip } from '@unlock-protocol/ui'
import Link from 'next/link'
import { FiTwitter } from 'react-icons/fi'
import { Metadata } from '~/components/interface/locks/metadata/utils'
import { getEventDate } from './utils'

interface TweetItButtonProps {
  event: Partial<Metadata>
}

export const TweetItButton = ({ event }: TweetItButtonProps) => {
  const eventDate = getEventDate(event.ticket)

  if (!event.name || !eventDate) {
    return null
  }

  const tweetIntent = new URL('https://twitter.com/intent/tweet')
  tweetIntent.searchParams.set(
    'text',
    `🎟️ I will be attending ${event.name} on ${eventDate.toLocaleDateString(
      undefined,
      {
        timeZone: event?.ticket?.event_timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    )}. \n\nGet your ticket with @unlockProtocol!`
  )
  tweetIntent.searchParams.set('url', window.location.toString())

  return (
    <Tooltip
      delay={0}
      label="Share on Twitter"
      tip="Share on Twitter"
      side="bottom"
    >
      <Link
        target="_blank"
        href={tweetIntent}
        className="w-12 h-12 flex justify-center items-center"
      >
        <FiTwitter className="w-6 h-6" />
      </Link>
    </Tooltip>
  )
}

export default TweetItButton
