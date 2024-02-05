import { Tooltip } from '@unlock-protocol/ui'
import Link from 'next/link'
import { Metadata } from '~/components/interface/locks/metadata/utils'
import { getEventDate } from './utils'

interface CastItButtonProps {
  event: Partial<Metadata>
  eventUrl: string
}

export const CastItButton = ({ event, eventUrl }: CastItButtonProps) => {
  const eventDate = getEventDate(event.ticket)
  if (!event.name || !eventDate) {
    return null
  }

  const tweetIntent = new URL('https://warpcast.com/~/compose')
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
    )}.\n\n${eventUrl.toString()}`
  )
  // tweetIntent.searchParams.set('embeds&#91;&#93;', eventUrl.toString())
  // console.log(tweetIntent.toString())

  return (
    <Tooltip
      delay={0}
      label="Share on Farcaster"
      tip="Share on Farcaster"
      side="bottom"
    >
      <Link
        target="_blank"
        href={tweetIntent.toString()}
        className="w-12 h-12 flex justify-center items-center p-2"
      >
        <svg
          width="429"
          height="429"
          viewBox="0 0 429 429"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M110.587 66.7333H318.413V362.267H287.907V226.893H287.607C284.236 189.479 252.792 160.16 214.5 160.16C176.208 160.16 144.764 189.479 141.393 226.893H141.093V362.267H110.587V66.7333Z"
            fill="black"
          />
          <path
            d="M55.2933 108.68L67.6867 150.627H78.1733V320.32C72.9082 320.32 68.64 324.588 68.64 329.853V341.293H66.7333C61.4682 341.293 57.2 345.562 57.2 350.827V362.267H163.973V350.827C163.973 345.562 159.705 341.293 154.44 341.293H152.533V329.853C152.533 324.588 148.265 320.32 143 320.32H131.56V108.68H55.2933Z"
            fill="black"
          />
          <path
            d="M289.813 320.32C284.548 320.32 280.28 324.588 280.28 329.853V341.293H278.373C273.108 341.293 268.84 345.562 268.84 350.827V362.267H375.613V350.827C375.613 345.562 371.345 341.293 366.08 341.293H364.173V329.853C364.173 324.588 359.905 320.32 354.64 320.32V150.627H365.127L377.52 108.68H301.253V320.32H289.813Z"
            fill="black"
          />
        </svg>
      </Link>
    </Tooltip>
  )
}

export default CastItButton
