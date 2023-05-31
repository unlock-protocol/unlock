import { Footer, HeaderNav } from '@unlock-protocol/ui'
import { ReactNode } from 'react'
import { CgArrowLongRight as ArrowRight } from 'react-icons/cg'
import { EMAIL_SUBSCRIPTION_FORM } from '../../config/constants'
import { unlockConfig } from '../../config/unlock'
import { useMembership } from '../../hooks/useMembership'

interface Props {
  children?: ReactNode | ReactNode[]
}

const MENU = {
  extraClass: {
    mobile: 'bg-brand-primary px-6',
  },
  logo: {
    url: '/',
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
              url: '/guides/unlock-discourse-plugin/',
            },
            {
              title: 'Guild.xyz',
              url: '/guides/guild-xyz/',
            },
            {
              title: 'Wordpress',
              url: '/guides/guide-to-the-unlock-protocol-wordpress-plugin/',
            },
          ],
        },
        {
          title: 'Watch Tutorials',
          src: '/images/illustrations/youtube-tutorial.png',
          url: 'https://www.youtube.com/watch?v=Elk0vsZLmD4&list=PL4EDTaxNLpu76SiayMqTKrVQYp4zAZM0W', // link to
        },
      ],
    },
    {
      title: 'Creator',
      options: [
        {
          title: 'Create Digital Collectibles with Unlock Protocol',
          src: '/images/marketing/collectible.png',
          url: '/guides/how-to-use-different-images/',
        },
        {
          title: 'How to Sell NFT Tickets for an Event',
          src: '/images/marketing/event.png',
          url: '/guides/how-to-sell-nft-tickets-for-an-event/',
        },
        {
          title: 'Recurring Memberships',
          src: '/images/marketing/recurring.png',
          url: '/guides/recurring-memberships/',
        },
        {
          title: 'Articles for you',
          options: [
            {
              title: 'How to sell membership NFT',
              url: '/guides/how-to-sell-membership-nfts/',
            },
            {
              title: 'Customizing Locks on OpenSea',
              url: '/guides/customizing-locks-on-opensea/',
            },
            {
              title: 'How to airdrop memberships',
              url: '/guides/how-to-airdrop-memberships/',
            },
            {
              title: 'View all',
              url: '/guides',
            },
          ],
        },
      ],
    },
    {
      title: 'Products',
      options: [
        {
          title: 'Membership Dashboard',
          src: '/images/marketing/dashboard.png',
          description: 'Deploy your membership contract with few clicks.',
          url: `${unlockConfig.appURL}/locks`,
        },
        {
          title: 'ALPHAtweet',
          src: '/images/marketing/img-alphatweet.png',
          url: 'https://alphatweet.xyz/',
          description: 'Make money through creating or sharing content.',
        },
        {
          title: 'Events by Unlock Labs',
          src: '/images/marketing/events.png',
          url: 'https://events.unlock-protocol.com/',
          description: 'Ticketing events with Unlock is simple.',
        },
        {
          title: 'Certification by Unlock Labs',
          src: '/images/marketing/img-unlock-certification.png',
          url: 'https://certifications.unlock-protocol.com/',
          description: 'Certify and show expertise on chain.',
        },
        {
          title: 'Flocker',
          src: '/images/marketing/flocker.png',
          url: 'https://flocker.app/',
          description: 'Connect with your fans and followers nearly anywhere.',
        },
      ],
    },

    {
      title: 'Blog',
      url: '/blog',
    },
    {
      title: 'More',
      small: true,
      options: [
        {
          title: '',
          options: [
            {
              title: 'Showcase',
              url: 'https://showcase.unlock-protocol.com/',
            },
            {
              title: 'State of Unlock',
              url: '/state',
            },
            {
              title: 'Unlock DAO',
              url: '/blog/unlock-dao',
            },
            {
              title: 'Roadmap',
              url: 'https://docs.unlock-protocol.com/governance/roadmap/',
            },
            {
              title: 'Upcoming Events',
              url: '/upcoming-events',
            },
            {
              title: 'Grants Program',
              url: '/grants',
            },
          ],
        },
      ],
    },
  ],
  actions: [
    {
      title: 'Launch App',
      url: `${unlockConfig.appURL}/locks`,
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
      url: '/',
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
        title: 'Products',
        options: [
          {
            label: 'Membership Dashboard',
            url: `${unlockConfig.appURL}/locks`,
          },
          {
            label: 'Events By Unlock',
            url: 'https://events.unlock-protocol.com/',
          },
          {
            label: 'Flocker',
            url: 'https://flocker.app/',
          },
        ],
      },
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
            url: '/blog/unlock-dao',
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

  const containerClass = 'container w-full mx-auto max-w-7xl'

  return (
    <>
      <div className="px-6">
        <div className={`${containerClass}`}>
          <HeaderNav {...MENU} />
        </div>
      </div>

      {children}
      <div className="px-6">
        <div className={`${containerClass} md:pt-14 pt-4`}>
          <Footer {...FOOTER} />
        </div>
      </div>
    </>
  )
}
