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
    <div id="get-started" className="flex flex-col gap-6">
      <div className="w-full space-y-4 break-words md:w-3/4 lg:w-1/2">
        <h1 className="text-4xl font-bold sm:text-5xl">Try it yourself</h1>
        <div className="space-y-2">
          <p className="text-lg sm:text-xl text-brand-gray ">
            Connect your wallet, follow the steps, and you&apos;ll receive free
            access to our members-only Discord.
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center p-8 h-96 glass-pane rounded-3xl">
        {isMember === 'yes' ? (
          <div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                iconLeft={<DiscordIcon size={18} />}
                href={SOCIAL_URL.discord}
                as={Link}
              >
                Join Discord
              </Button>
              <Button
                iconLeft={<DiscourseIcon size={18} />}
                href={SOCIAL_URL.discourse}
                as={Link}
              >
                Join Discouse
              </Button>
              <Button
                iconLeft={<TwitterIcon size={18} />}
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
    </div>
  )
}
