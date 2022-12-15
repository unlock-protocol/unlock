import { Footer } from '@unlock-protocol/ui'
import { ReactNode } from 'react'
import { HeaderNav } from '@unlock-protocol/ui'
import { CgArrowLongRight as ArrowRight } from 'react-icons/cg'
import { EMAIL_SUBSCRIPTION_FORM } from '../../config/constants'
import { unlockConfig } from '../../config/unlock'
import { useMembership } from '../../hooks/useMembership'

interface Props {
  children?: ReactNode | ReactNode[]
}

const MENU = {
  logo: {
    url: 'https://unlock-protocol.com/',
  },
  menuSections: [
    {
      title: 'Devs',
      options: [
        {
          title: 'Core Protocol',
          options: [
            {
              title: 'Unlock Smart Contracts',
              url: 'https://docs.unlock-protocol.com/core-protocol/',
            },
            {
              title: 'Deploying Locks',
              url: 'https://docs.unlock-protocol.com/core-protocol/public-lock/deploying-locks/',
            },
            {
              title: 'Hooks',
              url: 'https://docs.unlock-protocol.com/core-protocol/public-lock/hooks',
            },
          ],
        },
        {
          title: 'Tools',
          options: [
            {
              title: 'Unlock-js',
              url: 'https://docs.unlock-protocol.com/tools/unlock.js',
            },
            {
              title: 'Sign in with Ethereum',
              url: 'https://docs.unlock-protocol.com/tools/sign-in-with-ethereum/',
            },
            {
              title: 'Subgraph',
              url: 'https://docs.unlock-protocol.com/tutorials/misc/using-subgraphs/',
            },
          ],
        },
        {
          title: 'Integrations',
          options: [
            {
              title: 'Shopify',
              url: 'https://github.com/pwagner/unlock-shopify-app',
            },
            {
              title: 'Discourse',
              url: 'https://unlock-protocol.com/guides/unlock-discourse-plugin/',
            },
            {
              title: 'Guild.xyz',
              url: 'https://unlock-protocol.com/guides/guild-xyz/',
            },
            {
              title: 'Wordpress',
              url: 'https://unlock-protocol.com/guides/guide-to-the-unlock-protocol-wordpress-plugin/',
            },
          ],
        },
        {
          title: 'Watch Tutorials',
          embed:
            '<iframe src="https://plugins.flockler.com/embed/iframe/18462b3104603cf8399278dfcbdfdad8/1850c9aba1e022ab838f498cc9cff0ee" height="800" style="display: block; border: none; width: 100%;" allowfullscreen> </iframe>',
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
              title: 'How to sell membership NFT',
              url: 'https://unlock-protocol.com/guides/how-to-sell-membership-nfts/',
            },
            {
              title: 'Customizing Locks on OpenSea',
              url: 'https://unlock-protocol.com/guides/customizing-locks-on-opensea/',
            },
            {
              title: 'How to airdrop memberships',
              url: 'https://unlock-protocol.com/guides/how-to-airdrop-memberships/',
            },
            {
              title: 'View all',
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
          title: '',
          options: [
            /* show link when `State of Unlock` page is ready
            {
              title: 'State of Unlock',
              url: 'https://unlock-protocol.com/state',
            },
          },
          */
            {
              title: 'Unlock DAO',
              url: 'https://unlock-protocol.com/blog/unlock-dao',
            },
            {
              title: 'Roadmap',
              url: 'https://docs.unlock-protocol.com/governance/roadmap/',
            },
            {
              title: 'Upcoming Events',
              url: 'https://unlock-protocol.com/upcoming-events',
            },
            {
              title: 'Grants Program',
              url: 'https://unlock-protocol.com/grants',
            },
          ],
        },
      ],
    },
  ],
  actions: [
    {
      title: 'Launch App',
      url: 'https://app.unlock-protocol.com',
      icon: ArrowRight,
    },
  ],
}

export function Layout({ children }: Props) {
  const { becomeMember } = useMembership()

  const FOOTER = {
    subscriptionForm: {
      title: 'Sign up for Updates',
      description:
        'Receive fresh news about Unlock, including new features and opportunities to contribute',
      onSubmit: async (email: string) => {
        const { portalId, formGuid } = EMAIL_SUBSCRIPTION_FORM
        const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: [
              {
                name: 'email',
                value: email,
              },
            ],
          }),
        }

        await fetch(endpoint, options)
      },
    },
    logo: {
      url: 'https://unlock-protocol.com/',
    },
    privacyUrl: '/privacy',
    termsUrl: '/terms',
    actions: [
      {
        label: 'Launch App',
        url: `${unlockConfig.appURL!}/locks`,
      },
      {
        label: 'Get Unlock Membership',
        onClick: async () => {
          await becomeMember()
        },
      },
    ],
    menuSections: [
      {
        title: 'About',
        options: [
          { label: 'About Unlock', url: '/about' },
          {
            label: 'Roadmap',
            url: 'https://docs.unlock-protocol.com/governance/roadmap/',
          },
          {
            label: 'Careers',
            url: 'https://www.notion.so/unlockprotocol/Unlock-Jobs-907811d15c4d490091eb298f71b0954c',
          },
        ],
      },
      {
        title: 'Governance',
        options: [
          {
            label: 'Unlock DAO',
            url: 'https://unlock-protocol.com/blog/unlock-dao',
          },
          { label: 'Forum', url: 'https://unlock.community/' },
          {
            label: 'Snapshot',
            url: 'https://snapshot.org/#/unlock-protocol.eth',
          },
        ],
      },
      {
        title: 'Community',
        options: [
          { label: 'Showcase', url: 'https://showcase.unlock-protocol.com/' },
          { label: 'Blog', url: '/blog' },
          { label: 'Events', url: '/upcoming-events' },
          { label: 'Grants', url: '/grants' },
        ],
      },
      {
        title: 'Resources',
        options: [
          { label: 'Docs', url: 'https://docs.unlock-protocol.com/' },
          { label: 'Developers', url: '/developers' },
          { label: 'Guides', url: '/guides' },
          {
            label: 'Integrations',
            url: 'https://docs.unlock-protocol.com/move-to-guides/plugins-and-integrations/',
          },
          {
            label: 'Media kit',
            url: 'https://unlockprotocol.notion.site/Press-Kit-35836bdcc88f400eb5bb429c477c3333',
          },
        ],
      },
    ],
  }

  return (
    <>
      <div className="container mx-auto">
        <HeaderNav {...MENU} />
      </div>
      {children}
      <div className="container px-6 pt-4 mx-auto md:px-0 md:pt-14 max-w-7xl">
        <Footer {...FOOTER} />
      </div>
    </>
  )
}
