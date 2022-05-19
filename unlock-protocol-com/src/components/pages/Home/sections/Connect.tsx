import { Avatar, AvatarImage } from '@radix-ui/react-avatar'
import { Button } from '@unlock-protocol/ui'
import { unlockConfig } from '../../../../config/unlock'
import { Link } from '../../../helpers/Link'
import { BulletPointIcon } from '../../../icons'

const UNLOCK_BENEFITS = [
  'Create memberships and sell access NFTs in minutes',
  'Token-gating, memberships, ticketing, and more',
  'Open-source, community governed',
]

export function Connect() {
  return (
    <section className="flex flex-col-reverse items-center justify-between mx-auto lg:space-x-16 max-w-7xl md:gap-6 md:flex-row">
      <div className="w-full max-w-xl">
        <header className="space-y-4 break-words ">
          <h1 className="heading">Connect with your 1000 true fans</h1>
          <p className="sub-heading">
            For creative communities and the humans who build them
          </p>
        </header>
        <div className="py-6">
          <ul>
            {UNLOCK_BENEFITS.map((text, index) => (
              <li
                className={`border-t border-brand-gray py-4 items-center flex gap-4 ${
                  !UNLOCK_BENEFITS[index + 1] && 'border-b'
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
        </div>

        <div className="flex items-center justify-center gap-4 sm:justify-start">
          <Button href="#get-started" as={Link}>
            Get Started
          </Button>
          <Button as={Link} href={unlockConfig.appURL} variant="secondary">
            Dashboard
          </Button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 sm:justify-start">
          <a target="_blank" rel="noopener">
            <img
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=346805&theme=light"
              alt="Unlock&#0032;Protocol&#0032;Recurring&#0032;Subscriptions - Launch&#0032;recurring&#0032;subscriptions&#0032;using&#0032;NFTs | Product Hunt"
              style={{ width: '250px', height: '54px' }}
              width="250"
              height="54"
            />
          </a>
        </div>
      </div>

      <div className="flex justify-center w-full pb-6 max-w-fit lg:max-w-md md:pb-0">
        <Link href="/blog/talesofelatora">
          <div className="w-full bg-white glass-pane rounded-3xl ">
            <header className="items-center justify-between hidden w-full gap-2 px-6 py-4 sm:flex">
              <p className="font-bold">Tales of Elatora</p>
              <p className="font-mono text-sm font-bold text-brand-ui-primary">
                Powered by Unlock
              </p>
            </header>
            <img
              className="w-full object-fit rounded-t-xl sm:rounded-none"
              alt="Caroline"
              src="/images/marketing/home-card.png"
            />
            <div className="flex items-center gap-4 px-6 py-4">
              <div>
                <Avatar className="overflow-hidden">
                  <AvatarImage
                    className="inline-block w-10 h-10 rounded-full"
                    src="/images/marketing/caroline.png"
                    alt="Calorine"
                  />
                </Avatar>
              </div>
              <div>
                <h4 className="font-bold"> Caroline </h4>
                <p className="text-sm brand-gray"> Sold out mint in one day </p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}
