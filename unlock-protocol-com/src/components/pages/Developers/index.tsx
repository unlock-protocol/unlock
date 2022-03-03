import { Link } from '../../helpers/Link'
import { Button } from '@unlock-protocol/ui'

import {
  FaWordpressSimple as WordpressIcon,
  FaFileContract as ContractIcon,
  FaEthereum as EthereumIcon,
  FaCloudflare as CloudflareIcon,
  FaDiscourse as DiscourseIcon,
  FaDiscord as DiscordIcon,
  FaShopify as ShopifyIcon,
  FaKey as KeyIcon,
  FaLock as LockIcon,
} from 'react-icons/fa'
import { GoBrowser as BrowserIcon } from 'react-icons/go'
import { IoTicketSharp as TicketIcon } from 'react-icons/io5'
import { UnlockIcon } from '../../icons/Unlock'
import {
  SiWebflow as WebFlowIcon,
  SiHiveBlockchain as ChainsIcon,
  SiFirebase as FirebaseIcon,
} from 'react-icons/si'
import { DecentralLand } from '../../icons/Brand'
import { SOCIAL_URL } from '../../../config/seo'
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'

import {
  FiArrowLeft as ArrowLeftIcon,
  FiArrowRight as ArrowRightIcon,
} from 'react-icons/fi'

export const DEVELOPER_RECIPES = [
  {
    Icon: WordpressIcon,
    title: 'Integrate Unlock with Wordpress',
    href: 'https://docs.unlock-protocol.com/unlock/creators/plugins-and-integrations/wordpress-plugin',
    description:
      'Check how you can use unlock wordpress plugin to token gate content on wordpress.',
  },
  {
    Icon: ContractIcon,
    title: 'Using an existing NFT contract',
    href: 'https://docs.unlock-protocol.com/unlock/creators/tutorials-1/using-an-existing-nft-contract',
    description:
      'Your lock is an NFT contract, but you can also plug-in an existing ERC721 contract easily to make sure any of the holder is treated as a valid member',
  },

  {
    Icon: EthereumIcon,
    title: 'Sign-in With Ethereum',
    href: 'https://docs.unlock-protocol.com/unlock/developers/sign-in-with-ethereum',
    description:
      'In most applications, the first step is to identify users, Unlock provides an easy way to identify users.',
  },

  {
    Icon: TicketIcon,
    title: 'Selling tickets for an event',
    href: 'https://docs.unlock-protocol.com/unlock/creators/tutorials-1/selling-tickets-for-an-event',
    description:
      'A ticket to a conference, a concert or a meetup is a membership to that event. With Unlock, you can easily sell tickets to events you organize!',
  },
]

export const UNLOCK_COMMUNITY_INTEGRATIONS = [
  {
    Icon: WordpressIcon,
    name: 'Wordpress',
    href: 'https://docs.unlock-protocol.com/unlock/creators/plugins-and-integrations/wordpress-plugin',
  },
  {
    Icon: DiscourseIcon,
    name: 'Discourse',
    href: 'https://unlock.community/t/unlock-discourse-plugin/64',
  },
  {
    Icon: ShopifyIcon,
    name: 'Shopify',
    href: 'https://github.com/pwagner/unlock-shopify-app',
  },
  {
    Icon: DiscordIcon,
    name: 'Discord',
    href: 'https://docs.unlock-protocol.com/unlock/creators/plugins-and-integrations/discord-with-collab.land',
  },
  {
    Icon: WebFlowIcon,
    name: 'Webflow',
    href: 'https://unlock-integration.webflow.io/',
  },
  {
    Icon: CloudflareIcon,
    name: 'Cloudflare',
    href: 'https://github.com/unlock-protocol/cloudflare-worker',
  },
  {
    Icon: DecentralLand,
    name: 'DecentralLand',
    href: 'https://docs.unlock-protocol.com/unlock/creators/plugins-and-integrations/decentraland',
  },

  {
    Icon: FirebaseIcon,
    name: 'Firebase',
    href: 'https://david-layton.gitbook.io/novum/',
  },
]

export const UNLOCK_HOW_FOR_DEVELOPERS = [
  {
    Icon: LockIcon,
    text: 'Create Locks through our dashboard or API and place them anywhere you want to check for memberships.',
  },
  {
    Icon: KeyIcon,
    text: 'Users buy Keys (Non Fungible Tokens) which are checked by the lock. Valid keys grant users access.',
  },
  {
    Icon: BrowserIcon,
    text: 'Locks can be added to any kind of software, from web applications, to native games, through SAAS platforms.',
  },
  {
    Icon: ChainsIcon,
    text: 'Unlock supports multiple chains, price in any ERC20, and Credit Card checkout.',
  },
]

export interface Props {}

export function Developers({}: Props) {
  return (
    <div className="p-6">
      <div className="mx-auto  max-w-7xl">
        <div className="space-y-4">
          <header className="space-y-2">
            <h1 className="heading">Developers</h1>
            <p className="sub-heading">
              Build applications with customizable membership NFTs.
            </p>
          </header>
          <main className="py-4 space-y-12">
            <HowUnlockWorks />
            <RecipeSection />
            <CommunitySection />
            <GrantSection />
            <GotStuckSection />
          </main>
        </div>
      </div>
    </div>
  )
}

function RecipeSection() {
  const [viewportRef, embla] = useEmblaCarousel({
    dragFree: true,
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
  })

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false)
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false)
  const scrollPrev = useCallback(() => embla && embla.scrollPrev(), [embla])
  const scrollNext = useCallback(() => embla && embla.scrollNext(), [embla])

  const onSelect = useCallback(() => {
    if (!embla) return
    setPrevBtnEnabled(embla.canScrollPrev())
    setNextBtnEnabled(embla.canScrollNext())
  }, [embla])
  useEffect(() => {
    if (!embla) return
    embla.on('select', onSelect)
    onSelect()
  }, [embla, onSelect])

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold sm:text-3xl"> Recipes </h2>
          <p className="text-lg text-brand-gray">
            Learn how to develop with Unlock.
          </p>
        </div>

        <div className="justify-end hidden gap-4 sm:flex">
          <button
            className="p-2 border rounded-full disabled:opacity-25 disabled:cursor-not-allowed border-brand-gray"
            aria-label="previous"
            onClick={scrollPrev}
            disabled={!prevBtnEnabled}
          >
            <ArrowLeftIcon size={24} />
          </button>
          <button
            className="p-2 border rounded-full disabled:opacity-25 disabled:cursor-not-allowed border-brand-gray"
            aria-label="next"
            onClick={scrollNext}
            disabled={!nextBtnEnabled}
          >
            <ArrowRightIcon size={24} />
          </button>
        </div>
      </header>
      <div className="relative max-w-fit">
        <div className="overflow-hidden cursor-move" ref={viewportRef}>
          <div className="flex gap-8 p-6 ml-4 select-none">
            {DEVELOPER_RECIPES.map(
              ({ Icon, title, description, href }, index) => (
                <Link key={index} href={href}>
                  <div className="block h-full p-6 space-y-4 border-2 border-transparent w-72 sm:w-72 glass-pane rounded-3xl ">
                    <div>
                      <Icon
                        className="fill-brand-ui-primary"
                        key={index}
                        size={40}
                      />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium"> {title}</h3>
                      <p className="text-brand-gray"> {description}</p>
                    </div>
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function GrantSection() {
  return (
    <div className="p-6 space-y-6 rounded-3xl glass-pane">
      <div className="space-y-2 leading-relaxed">
        <h3 className="text-2xl font-semibold sm:text-3xl">
          Join our Developer Grant Program
        </h3>
        <p className="text-base text-brand-gray sm:text-lg">
          Unlock Protocol is giving UDT token grants to developers who can make
          the platform more accessible to wider communities.
        </p>
      </div>
      <div className="inline-block">
        <Button
          iconLeft={
            <UnlockIcon className="fill-white" height={14} width={14} />
          }
          as={Link}
          href="/grants"
        >
          Learn more about grants
        </Button>
      </div>
    </div>
  )
}

function CommunitySection() {
  return (
    <div className="p-6 space-y-4 text-white rounded-3xl bg-brand-ui-primary">
      <header>
        <div className="flex justify-center">
          <h3 className="text-xl font-semibold">
            Integrations built by the Unlock Community
          </h3>
        </div>
      </header>
      <div className="grid items-center gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {UNLOCK_COMMUNITY_INTEGRATIONS.map(({ Icon, href, name }, index) => (
          <Button
            href={href}
            iconLeft={<Icon />}
            as={Link}
            key={index}
            variant="secondary"
          >
            {name}
          </Button>
        ))}
      </div>
    </div>
  )
}

function HowUnlockWorks() {
  return (
    <div className="space-y-4">
      <header>
        <div className="leading-relaxed">
          <h3 className="text-xl font-semibold sm:text-3xl">
            How Unlock works
          </h3>
          <p className="text-lg text-brand-gray">
            Unlock has two distinct concepts - Locks and Keys
          </p>
        </div>
      </header>
      <ol className="space-y-4">
        {UNLOCK_HOW_FOR_DEVELOPERS.map(({ text, Icon }, index) => (
          <li
            className="flex flex-col items-center gap-4 p-4 sm:flex-row rounded-3xl glass-pane"
            key={index}
          >
            <span className="p-2 border rounded-3xl">
              <Icon size={24} className="fill-brand-ui-primary" />
            </span>
            <p>{text}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

function GotStuckSection() {
  return (
    <div className="space-y-6">
      <header>
        <div className="leading-relaxed">
          <h3 className="text-xl font-semibold sm:text-3xl">
            Have Questions? Got Stuck? Need an inspiration?
          </h3>
          <p className="text-lg text-brand-gray">
            Connect with a community of developers on Discord and Github
            building cool stuff with Unlock.
          </p>
        </div>
      </header>

      <div className="flex gap-6">
        <Button as={Link} href={SOCIAL_URL.discord} variant="outlined-primary">
          Join Discord
        </Button>
        <Button as={Link} href={SOCIAL_URL.github} variant="outlined-primary">
          Join Github
        </Button>
      </div>
    </div>
  )
}
