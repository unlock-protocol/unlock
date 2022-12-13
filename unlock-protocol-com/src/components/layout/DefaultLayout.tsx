import { ReactNode } from 'react'
import Footer from '../interface/Footer'
import { HeaderNav } from '@unlock-protocol/ui'
import { CgArrowLongRight as ArrowRight } from 'react-icons/cg'

interface Props {
  children?: ReactNode | ReactNode[]
}

const MENU = {
  logoUrl: 'https://unlock-protocol.com/',
  menuSections: [
    {
      title: 'Devs',
      options: [
        {
          title: 'Core Protocol',
          options: [
            {
              label: 'Unlock Smart Contracts',
              url: 'https://docs.unlock-protocol.com/core-protocol/',
            },
            {
              label: 'Deploying Locks',
              url: 'https://docs.unlock-protocol.com/core-protocol/public-lock/deploying-locks/',
            },
            {
              label: 'Hooks',
              url: 'https://docs.unlock-protocol.com/core-protocol/smart-contracts-api/archive/hooks', //todo: fix link
            },
          ],
        },
        {
          title: 'Tools',
          options: [
            {
              label: 'Building token gated applications',
              url: 'https://docs.unlock-protocol.com/tutorials/building-token-gated-applications/',
            },
            {
              label: 'Sign in with Ethereum',
              url: 'https://docs.unlock-protocol.com/tools/sign-in-with-ethereum/',
            },
            {
              label: 'Subgraph',
              url: 'https://docs.unlock-protocol.com/tutorials/misc/using-subgraphs/',
            },
          ],
        },
        {
          title: 'Integrations',
          options: [
            {
              label: 'Shopify',
              url: 'https://github.com/pwagner/unlock-shopify-app',
            },
            {
              label: 'Discourse',
              url: 'https://unlock-protocol.com/guides/unlock-discourse-plugin/',
            },
            {
              label: 'Guild.xyz',
              url: 'https://unlock-protocol.com/guides/guild-xyz/',
            },
            {
              label: 'Wordpress',
              url: 'https://unlock-protocol.com/guides/guide-to-the-unlock-protocol-wordpress-plugin/',
            },
          ],
        },
        {
          title: 'Watch Tutorials',
          embed: '', // todo: set embed
        },
      ],
    },
    {
      title: 'Creator',
      options: [
        {
          title: 'Create Digital Collectibles with Unlock Protocol',
          src: '/images/marketing/collectible.png',
          url: 'https://unlock-protocol.com/guides/how-to-use-different-images/',
        },
        {
          title: 'How to Sell NFT Tickets for an Event',
          src: '/images/marketing/event.png',
          url: 'https://unlock-protocol.com/guides/how-to-sell-nft-tickets-for-an-event/',
        },
        {
          title: 'Recurring Memberships',
          src: '/images/marketing/recurring.png',
          url: 'https://unlock-protocol.com/guides/recurring-memberships/',
        },
        {
          title: 'Articles for you',
          options: [
            {
              label: 'How to sell membership NFT',
              url: 'https://unlock-protocol.com/guides/how-to-sell-membership-nfts/',
            },
            {
              label: 'Customizing Locks on OpenSea',
              url: 'https://unlock-protocol.com/guides/customizing-locks-on-opensea/',
            },
            {
              label: 'How to airdrop memberships',
              url: 'https://unlock-protocol.com/guides/how-to-airdrop-memberships/',
            },
            {
              label: 'View all',
              url: 'https://unlock-protocol.com/guides',
            },
          ],
        },
      ],
    },
    {
      title: 'Showcase',
      url: 'https://showcase.unlock-protocol.com/',
    },
    {
      title: 'Blog',
      url: 'https://unlock-protocol.com/blog',
    },
    {
      title: 'More',
      options: [
        {
          label: '',
          options: [
            /* show link when `State of Unlock` page is ready
            {
              label: 'State of Unlock',
              url: 'https://unlock-protocol.com/state',
            },
          },
          */
            {
              label: 'Unlock DAO',
              url: 'https://unlock-protocol.com/blog/unlock-dao',
            },
            {
              label: 'Roadmap',
              url: 'https://docs.unlock-protocol.com/governance/roadmap/',
            },
            {
              label: 'Upcoming Events',
              url: 'https://unlock-protocol.com/upcoming-events',
            },
            {
              label: 'Grants Program',
              url: 'https://unlock-protocol.com/grants',
            },
            {
              label: 'Got Questions?',
              url: '', // todo: send to email? discord? form?
            },
          ],
        },
      ],
    },
  ],
  actions: [
    {
      label: 'Launch App',
      url: 'https://app.unlock-protocol.com',
      icon: ArrowRight,
    },
  ],
}

export function Layout({ children }: Props) {
  return (
    <>
      <div className="container mx-auto">
        <HeaderNav {...MENU} />
      </div>
      {children}
      <Footer />
    </>
  )
}
