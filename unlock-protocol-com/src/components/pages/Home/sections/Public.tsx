import { Button } from '@unlock-protocol/ui'
import { BulletPointIcon } from '../../../icons'
import { Link } from '../../../helpers/Link'
import { UNLOCK_LINKS } from '../../../../config/constants'

const PUBLIC_MARKETING_POINTS = [
  'Connect with a passionate community',
  'Determine the protocol’s future',
  'Help build the web3 foundation',
]

export function Public() {
  return (
    <div className="flex flex-col-reverse items-center gap-4 sm:gap-12 md:gap-24 lg:gap-32 sm:flex-row">
      <div className="w-full">
        <div className="w-full space-y-4 break-words">
          <h1 className="text-4xl font-bold sm:text-5xl">
            We&apos;re building a public good together
          </h1>
          <div className="space-y-2">
            <p className="text-lg sm:text-xl text-brand-gray ">
              Our mission is to create a protocol that belongs to the users,
              creators and builders – not Unlock Inc.
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
          <Link href={UNLOCK_LINKS.governance}>Read on governance </Link>
        </Button>
      </div>

      <div className="w-full ">
        <img alt="Unlock Community" src="/images/marketing/community.png" />
      </div>
    </div>
  )
}
