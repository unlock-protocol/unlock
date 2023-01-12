import { Button } from '@unlock-protocol/ui'
import useEmblaCarousel from 'embla-carousel-react'
import { unlockConfig } from '../../../../config/unlock'
import { Link } from '../../../helpers/Link'
import { BulletPointIcon } from '../../../icons'
import Autoplay from 'embla-carousel-autoplay'

const UNLOCK_BENEFITS = [
  'Create and manage your membership contracts',
  'Airdrop or sell membership NFT in minutes',
  'Token-gating, memberships, ticketing, and more',
  'Open-source, community governed smart-contracts',
]

interface FeaturedUser {
  link?: string
  title: string
  illustration: string
  quote: string
}
const featuredUsers: FeaturedUser[] = [
  {
    link: '/guides/how-to-sell-nft-tickets-for-an-event/',
    title: 'Event ticketing',
    illustration: '/images/marketing/event.png',
    quote:
      'Membership NFTs for event ticketing, check-in, and proof of attendance',
  },
  {
    link: '/guides/using-unlock-for-newsletters/',
    title: 'Media membership',
    illustration: '/images/marketing/newspapper.png',
    quote:
      'Membership access to content, video, streaming, music, podcast and other media',
  },
  {
    link: '/blog/talesofelatora',
    title: 'DAO membership',
    illustration: '/images/marketing/DAO-membership.png',
    quote:
      'Seasonal, time-based, or perpetual DAO memberships, community, and event access',
  },
  {
    link: '/blog/cdaa-unlock-case-study',
    title: 'Certification credentials',
    illustration: '/images/marketing/certificate.png',
    quote: 'On-chain certification NFTs for skills and continuing education',
  },
  {
    title: 'Digital collectibles',
    illustration: '/images/marketing/collectible.png',
    quote:
      'PFP collections, art NFTs and associated utility for community members',
  },
]

export function Connect() {
  const [emblaRef] = useEmblaCarousel(
    {
      dragFree: true,
      containScroll: 'trimSnaps',
      draggable: false,
    },
    [
      Autoplay({
        delay: 5000,
        stopOnMouseEnter: true,
      }),
    ]
  )

  return (
    <section className="flex flex-col-reverse items-center justify-between mx-auto lg:space-x-16 max-w-7xl md:gap-6 md:flex-row">
      <div className="w-full max-w-xl">
        <header className="space-y-4 break-words ">
          <h1 className="heading">Memberships in minutes</h1>
          <p className="sub-heading">
            Unlock is a protocol for memberships as time-bound Non Fungible
            Tokens
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

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-start">
          <Button href="#get-started" className="text-center" as={Link}>
            Join Community Membership
          </Button>
          <Button
            as={Link}
            className="text-center"
            href={`${unlockConfig.appURL}/locks/create`}
            variant="secondary"
          >
            Create Membership Contract
          </Button>
        </div>
      </div>

      <div
        className="w-full pb-6 overflow-hidden cursor-move max-w-fit lg:max-w-md md:pb-0"
        ref={emblaRef}
      >
        <div className="flex">
          {featuredUsers?.map(
            ({ title, link = '#', illustration, quote }, index) => {
              const key = `${title}-${index}`
                .split(' ')
                .join('-')
                .toLocaleLowerCase()

              const extraClassLink = link === '#' ? 'cursor-default' : ''

              return (
                <Link
                  key={key}
                  href={link}
                  className={[
                    'basis-full grow-0 shrink-0 background-red',
                    extraClassLink,
                  ].join(' ')}
                >
                  <div className="w-full bg-white rounded-3xl shadow-transparent">
                    <header className="items-center justify-between hidden w-full gap-2 px-6 py-4 sm:flex">
                      <p className="text-xl font-bold">{title}</p>
                    </header>
                    <img
                      className="object-cover w-full h-96 rounded-t-xl sm:rounded-none"
                      alt={title}
                      src={illustration}
                    />
                    <div className="flex h-[100px] sm:h-[80px] items-center gap-4 px-6 py-4">
                      <div>
                        <h4 className="block font-bold sm:hidden">{title}</h4>
                        <p className="text-sm brand-gray">{quote}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            }
          )}
        </div>
      </div>
    </section>
  )
}
