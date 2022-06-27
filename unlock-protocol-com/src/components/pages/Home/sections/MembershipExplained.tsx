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
    <section className="grid items-center justify-center gap-6 mx-auto max-w-7xl md:grid-cols-2 sm:flex-row sm:gap-x-16">
      <div className="w-full">
        <img
          alt="membership explained animation"
          src="images/svg/membership-explained.svg"
        />
      </div>
      <div className="space-y-6 ">
        <img
          aria-hidden
          className="not-sr-only sm:hidden"
          alt="frame"
          src="/images/svg/mobile-frame.svg"
        />
        <img
          aria-hidden
          className="hidden pb-2 not-sr-only sm:block"
          alt="frame"
          src="/images/svg/desktop-frame-2.svg"
        />
        <header className="space-y-4 break-words ">
          <h1 className="heading">
            Connecting humans through NFT-based memberships
          </h1>
          <p className="sub-heading">
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
              <p className="text-lg">{text}</p>
            </li>
          ))}
        </ul>
        <div className="flex">
          <Button
            as={Link}
            href="https://docs.unlock-protocol.com/#from-the-attention-economy-to-the-membership-economy"
          >
            Learn more about memberships
          </Button>
        </div>
      </div>
    </section>
  )
}
