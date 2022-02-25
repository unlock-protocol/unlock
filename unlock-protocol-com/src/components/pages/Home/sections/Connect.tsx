import { Avatar, AvatarImage } from '@radix-ui/react-avatar'
import { Button } from '@unlock-protocol/ui'
import { Link } from '../../../helpers/Link'
import { BulletPointIcon } from '../../../icons'

const UNLOCK_BENEFITS = [
  'Create memberships and sell access NFTs in minutes',
  'Token-gating, memberships, ticketing, and more',
  'Open-source, community governed',
]

export function Connect() {
  return (
    <section className="flex p-6 flex-col-reverse items-center sm:flex-row max-w-5xl mx-auto gap-6 sm:gap-x-16">
      <div className="w-full">
        <div className="w-full space-y-4 break-words">
          <h1 className="text-4xl font-bold sm:text-5xl">
            Connect with your 1000 true fans
          </h1>
          <p className="text-lg sm:text-xl text-brand-gray max-w-[300px]">
            For creative communities and the humans who build them
          </p>
        </div>
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
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-center gap-4 sm:justify-start">
          <Button href="#get-started" as={Link}>
            Get Started
          </Button>
          <Button variant="secondary"> Connect Wallet </Button>
        </div>
      </div>

      <div className="w-full max-w-fit sm:max-w-sm justify-center flex">
        <div className="w-full bg-white glass-pane rounded-3xl ">
          <header className="items-center justify-between hidden w-full gap-2 px-6 py-4 sm:flex">
            <p className="font-bold">Tales of Ronin</p>
            <p className="font-mono text-sm font-bold text-brand-ui-primary">
              Powered by Unlock
            </p>
          </header>
          <img
            className="rounded-t-xl sm:rounded-none"
            alt="Caroline"
            src="/images/marketing/home-card.png"
          />
          <div className="flex items-center gap-4 px-6 py-4">
            <div>
              <Avatar className="overflow-hidden">
                <div className="bg-orange-500 rounded-full bg-opacity-90 brightness-150">
                  <AvatarImage
                    className="inline-block w-10 h-10 rounded-full mix-blend-multiply"
                    src="/images/marketing/caroline.png"
                    alt="Calorine"
                  />
                </div>
              </Avatar>
            </div>
            <div className="grid">
              <p className="font-bold"> Caroline </p>
              <p className="text-sm brand-gray"> Sold out mint in one day </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
