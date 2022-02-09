import { Avatar, AvatarImage } from '@radix-ui/react-avatar'
import { Button } from '@unlock-protocol/ui'
import { BulletPointIcon } from '../../../icons'
const UNLOCK_MARKETING_POINTS = [
  'Create memberships and sell access NFTs in minutes',
  'Token-gating, memberships, ticketing, and more',
  'Open-source, community governed',
]

export function Connect() {
  return (
    <div className="flex flex-col-reverse items-center gap-4 sm:gap-12 md:gap-24 lg:gap-32 sm:flex-row">
      <div className="w-full">
        <div className="w-full space-y-4 break-words">
          <h1 className="text-4xl font-bold sm:text-5xl">
            Connect with your 1000 true fans
          </h1>
          <p className="text-lg sm:text-xl text-brand-gray max-w-[300px]">
            For creative communities and the humans who build them
          </p>
        </div>
        <div className="py-8">
          <ul>
            {UNLOCK_MARKETING_POINTS.map((text, index) => (
              <li
                className={`border-t border-brand-gray py-4 items-center flex gap-4 ${
                  !UNLOCK_MARKETING_POINTS[index + 1] && 'border-b'
                }`}
                key={index}
              >
                <BulletPointIcon className="fill-brand-ui-primary" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-4">
          <Button> Get Started </Button>
          <Button variant="secondary"> Connect Wallet </Button>
        </div>
      </div>

      <div className="w-full max-w-[380px]">
        <div className="w-full bg-white bg-shadow-and-glass rounded-3xl ">
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
    </div>
  )
}
