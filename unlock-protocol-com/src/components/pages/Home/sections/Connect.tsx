import { Avatar, AvatarImage } from '@radix-ui/react-avatar'
import { Button } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import { unlockConfig } from '../../../../config/unlock'
import { Link } from '../../../helpers/Link'
import { BulletPointIcon } from '../../../icons'

const UNLOCK_BENEFITS = [
  'Create memberships and sell access NFTs in minutes',
  'Token-gating, memberships, ticketing, and more',
  'Open-source, community governed',
]

const featuredUsers = [
  {
    link: '/blog/talesofelatora',
    title: 'Tales of Elatora',
    illustration: '/images/marketing/home-card.png',
    avatar: '/images/marketing/caroline.png',
    creator: 'Caroline',
    quote: 'Sold out mint in one day',
  },
  {
    link: 'https://bakery.fyi/bakery-nft/',
    title: 'The Bakery',
    illustration: '/images/marketing/featured/the-bakery/bakery.png',
    avatar: '/images/marketing/featured/the-bakery/avatar.jpg',
    creator: 'Croissant',
    quote: 'An NFT based DAO membership',
  },
]

export function Connect() {
  const [featured, setFeatured] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setFeatured((featured + 1) % featuredUsers.length)
    }, 5000)
    return () => {
      clearInterval(interval)
    }
  })

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
      </div>

      <div className="flex justify-center w-full pb-6 max-w-fit lg:max-w-md md:pb-0">
        <Link href={featuredUsers[featured].link}>
          <div className="w-full bg-white glass-pane rounded-3xl ">
            <header className="items-center justify-between hidden w-full gap-2 px-6 py-4 sm:flex">
              <p className="font-bold">{featuredUsers[featured].title}</p>
              <p className="font-mono text-sm font-bold text-brand-ui-primary">
                Powered by Unlock
              </p>
            </header>
            <img
              className="w-full h-96 object-cover rounded-t-xl sm:rounded-none"
              alt={featuredUsers[featured].title}
              src={featuredUsers[featured].illustration}
            />
            <div className="flex items-center gap-4 px-6 py-4">
              <div>
                <Avatar className="overflow-hidden w-10 h-10">
                  <AvatarImage
                    className="inline-block w-10 h-10 rounded-full"
                    src={featuredUsers[featured].avatar}
                    alt={featuredUsers[featured].creator}
                  />
                </Avatar>
              </div>
              <div>
                <h4 className="font-bold">{featuredUsers[featured].creator}</h4>
                <p className="text-sm brand-gray">
                  {featuredUsers[featured].quote}
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}
