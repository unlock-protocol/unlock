import { Placeholder } from '@unlock-protocol/ui'
import { PaywallConfigType } from '@unlock-protocol/core'
import { useEventAttendees } from '~/hooks/useEventAttendees'
import { useSocials } from '~/hooks/useSocials'
import Image from 'next/image'
import { useMultipleLockData } from '~/hooks/useLockData'

export const AttendeeCuesInternal = ({
  attendees,
  totalTickets,
}: {
  attendees: string[]
  totalTickets: number
}) => {
  const { socials, loading, error } = useSocials(attendees)

  if (error) {
    console.error(error)
  }

  if (loading) {
    return (
      <Placeholder.Root>
        <Placeholder.Line />
      </Placeholder.Root>
    )
  }

  const featuredAttendees = Object.values(socials)
    .filter((social) => social.profileDisplayName)
    .slice(0, 5)
    .map((social) => social.profileDisplayName)

  const andOthers = totalTickets - featuredAttendees.length

  if (totalTickets > 5 && Object.values(socials).length > 0) {
    return (
      <div className="flex flex-col gap-2">
        <ul className="flex flex-row ml-3">
          {Object.values(socials)
            .filter(
              (social) =>
                social.profileImage && !social.profileImage.startsWith('ipfs')
            )
            .slice(0, 12)
            .map((social) => {
              return (
                <li key={social.id} className="flex items-center -ml-3">
                  {social.profileImage && (
                    <Image
                      className="rounded-full w-8 h-8 border-2 border-white max-w-none"
                      alt={social.profileName}
                      width={20}
                      height={20}
                      src={social.profileImage}
                    />
                  )}
                </li>
              )
            })}
        </ul>
        <p>
          {featuredAttendees.join(', ')}{' '}
          {andOthers > 1 && `and ${andOthers} others`} are going.
        </p>
      </div>
    )
  }
  return null
}

export interface AttendeeCuesProps {
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

export const AttendeeCues = ({ checkoutConfig }: AttendeeCuesProps) => {
  const { data: attendees, isLoading } = useEventAttendees({
    checkoutConfig,
  })
  const loadingLocks = useMultipleLockData(checkoutConfig.config.locks)
  const isStillLoading = loadingLocks.some(({ isLockLoading }) => isLockLoading)

  if (isLoading || isStillLoading || !attendees) {
    return (
      <div className="p-4">
        <Placeholder.Root>
          <Placeholder.Line />
        </Placeholder.Root>
      </div>
    )
  }

  const totalTickets = loadingLocks.reduce(
    (acc, { lock }) => acc + (lock?.outstandingKeys || 0),
    0
  )

  if (attendees.length === 0) {
    return null
  }

  return (
    <div className="p-4">
      <AttendeeCuesInternal attendees={attendees} totalTickets={totalTickets} />
    </div>
  )
}
