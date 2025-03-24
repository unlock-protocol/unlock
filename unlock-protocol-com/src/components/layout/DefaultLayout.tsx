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
      title: 'Developers',
      small: true,
      options: [
        {
          title: '',
          options: [
            {
              title: 'Docs',
              url: 'https://docs.unlock-protocol.com/',
            },
            {
              title: 'Libraries and Tools',
              url: 'https://docs.unlock-protocol.com/libraries-and-sdks/',
            },
            {
              title: 'Code Examples',
              url: 'https://docs.unlock-protocol.com/examples/',
            },
            {
              title: 'Video Tutorials',
              url: 'https://www.youtube.com/unlock-protocol/',
            },
          ],
        },
      ],
    },

    {
      title: 'Products By Unlock Labs',
      small: true,
      options: [
        {
          title: '',
          options: [
            {
              title: 'Events',
              url: 'https://events.unlock-protocol.com/',
            },
            {
              title: 'Certifications',
              url: 'https://certifications.unlock-protocol.com/',
            },
            {
              title: 'Subscriptions',
              url: 'https://subscriptions.unlock-protocol.com/',
            },
            {
              title: 'Unlock Prime',
              url: 'https://app.unlock-protocol.com/prime',
              customStyle: {
                className: 'font-extrabold text-transparent bg-clip-text',
                style: {
                  backgroundImage:
                    'linear-gradient(85.7deg, #603DEB 3.25%, #F19077 90.24%)',
                },
              },
            },
          ],
        },
      ],
    },
    {
      title: 'Governance',
      small: true,
      options: [
        {
          title: '',
          options: [
            {
              title: 'Discuss',
              url: 'https://discord.unlock-protocol.com',
            },
            {
              title: 'Vote',
              url: 'https://www.tally.xyz/gov/unlock-protocol',
            },
            {
              title: 'Buy UP',
              url: 'https://app.uniswap.org/explore/tokens/base/0xac27fa800955849d6d17cc8952ba9dd6eaa66187',
            },
            {
              title: 'Docs',
              url: 'https://docs.unlock-protocol.com/governance/',
            },
          ],
        },
      ],
    },
    {
      title: 'Blog',
      url: 'https://unlock-protocol.com/blog',
    },
  ],
  actions: [
    {
      title: 'Launch App',
      url: `${unlockConfig.appURL}`,
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
    menuSections: [
      {
        title: 'Resources',
        options: [
          { label: 'Docs', url: 'https://docs.unlock-protocol.com/' },
          { label: 'Guides', url: '/guides' },
          {
            label: 'Integrations',
            url: 'https://docs.unlock-protocol.com/move-to-guides/plugins-and-integrations/',
          },
          {
            label: 'All Features',
            url: ' https://docs.unlock-protocol.com/getting-started/what-is-unlock/features-list',
          },
        ],
      },
      {
        title: 'Community',
        options: [
          { label: 'Blog', url: '/blog' },
          { label: 'Events', url: '/upcoming-events' },
          { label: 'Grants', url: '/grants' },
          {
            label: 'Ambassadors',
            url: 'https://unlockprotocol.notion.site/Unlock-Protocol-Locksmith-Ambassador-Program-11e7ea8513fc4ad8b1f93c1efe0f98cd',
          },
        ],
      },
      {
        title: 'Ecosystem',
        options: [
          { label: 'Showcase', url: 'https://showcase.unlock-protocol.com/' },
          {
            label: 'State of Unlock',
            url: 'https://unlock-protocol.com/state',
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
            url: 'https://snapshot.box/#/s:unlock-dao.eth',
          },
          {
            label: 'Tally',
            url: 'https://www.tally.xyz/gov/unlock-protocol',
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
          {
            label: 'Media Kit',
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
