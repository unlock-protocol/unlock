import { Button } from '@unlock-protocol/ui'
import { SOCIAL_URL } from '../../../../config/seo'
import { useMembership } from '../../../../hooks/useMembership'
import { Link } from '../../../helpers/Link'
import {
  FaDiscord as DiscordIcon,
  FaDiscourse as DiscourseIcon,
  FaTwitter as TwitterIcon,
} from 'react-icons/fa'

export function GetStarted() {
  const { isMember, becomeMember } = useMembership()
  return (
    <section
      id="get-started"
      className="p-6 mx-auto space-y-6 max-w-7xl	 sm:py-16"
    >
      <header className="w-full space-y-4 break-words md:w-3/4 lg:w-1/2">
        <h1 className="heading">Try it yourself</h1>
        <p className="text-xl sm:text-2xl text-brand-gray">
          Connect your wallet, follow the steps, and you&apos;ll receive free
          access to our members-only Discord.
        </p>
      </header>
      <div className="flex flex-col items-center justify-center p-8 h-96 glass-pane rounded-3xl">
        {isMember === 'yes' ? (
          <div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                iconLeft={<DiscordIcon key={1} size={18} />}
                href={SOCIAL_URL.discord}
                as={Link}
              >
                Join Discord
              </Button>
              <Button
                iconLeft={<DiscourseIcon key={2} size={18} />}
                href={SOCIAL_URL.discourse}
                as={Link}
              >
                Join Discourse
              </Button>
              <Button
                iconLeft={<TwitterIcon key={3} size={18} />}
                href={SOCIAL_URL.twitter}
                as={Link}
              >
                Follow Twitter
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => {
              becomeMember()
            }}
          >
            Checkout Unlock Membership
          </Button>
        )}
      </div>
    </section>
  )
}
