import { Button } from '@unlock-protocol/ui'
import { BulletPointIcon } from '../../../icons'
import { Link } from '../../../helpers/Link'
import { UNLOCK_LINKS } from '../../../../config/constants'

const PUBLIC_MARKETING_POINTS = [
  'Connect with a passionate community',
  "Determine the protocol's future",
  'Help build the web3 foundation',
]

export function Public() {
  return (
    <section className="flex flex-col-reverse items-center justify-between gap-6 px-6 py-12 mx-auto max-w-7xl	 sm:flex-row">
      <div className="max-w-lg">
        <div className="w-full space-y-4 break-words">
          <h1 className="heading">
            We&apos;re building a public good together
          </h1>
          <div className="space-y-2">
            <p className="sub-heading">
              Our mission is to create a protocol that belongs to the users,
              creators and builders - not Unlock Inc.
            </p>
          </div>
        </div>
        <div className="py-6">
          <ul>
            {PUBLIC_MARKETING_POINTS.map((text, index) => (
              <li
                className={`border-t border-brand-gray py-4 items-center flex gap-4 ${
                  !PUBLIC_MARKETING_POINTS[index + 1] && 'border-b'
                }`}
                key={index}
              >
                <BulletPointIcon className="fill-brand-ui-primary" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <Button>
          <Link href={UNLOCK_LINKS.governance}> Goverance FAQ </Link>
        </Button>
      </div>

      <div className="max-w-lg">
        <img alt="Unlock Community" src="/images/marketing/community.png" />
      </div>
    </section>
  )
}
