import { Button } from '@unlock-protocol/ui'
import { Link } from '../../../helpers/Link'
import { BulletPointIcon } from '../../../icons'

export const UNLOCK_MEMBERSHIP_BENEFITS = [
  'Restore your POWER as a creator',
  'Create new REVENUE streams with NFTs',
  'Have a DIRECT relationship with your members',
]

export function MembershipExplained() {
  return (
    <section className="flex flex-col items-center max-w-5xl gap-6 p-6 mx-auto sm:flex-row sm:gap-x-16">
      <div className="w-full">
        <video muted autoPlay loop className="pointer-none">
          <source src="/videos/marketing/membership.webm" type="video/webm" />
          <p> We couldn&apos;t load this video for you. </p>
        </video>
      </div>
      <div className="py-6 space-y-6">
        <header className="w-full space-y-4 break-words">
          <h2 className="text-4xl font-bold sm:text-5xl">
            Connecting humans through NFT-based memberships
          </h2>
          <p className="max-w-sm text-lg sm:text-xl text-brand-gray">
            Your members aren&apos;t a commodity. Stop allowing platforms to
            treat them like one.
          </p>
        </header>
        <ul>
          {UNLOCK_MEMBERSHIP_BENEFITS.map((text, index) => (
            <li
              className={`border-t border-brand-gray py-4 items-center flex gap-4 ${
                !UNLOCK_MEMBERSHIP_BENEFITS[index + 1] && 'border-b'
              }`}
              key={index}
            >
              <div>
                <BulletPointIcon className="fill-brand-ui-primary" />
              </div>
              <p>{text}</p>
            </li>
          ))}
        </ul>
        <div className="flex">
          <Button
            as={Link}
            href="https://docs.unlock-protocol.com/unlock/creators/selling-memberships"
          >
            Learn more about memberships
          </Button>
        </div>
      </div>
    </section>
  )
}
