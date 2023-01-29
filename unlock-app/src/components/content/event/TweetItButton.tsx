import { Tooltip } from '@unlock-protocol/ui'
import Link from 'next/link'
import { FiTwitter } from 'react-icons/fi'
import { EventData } from './EventDetails'

interface TweetItButtonProps {
  event: Partial<EventData>
}

export const TweetItButton = ({ event }: TweetItButtonProps) => {
  if (!event.title || !event.date) {
    return null
  }

  const tweetIntent = new URL('https://twitter.com/intent/tweet')
  tweetIntent.searchParams.set(
    'text',
    `🎉 I will be attending ${event.title} on ${event.date.toLocaleDateString(
      undefined,
      {
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
