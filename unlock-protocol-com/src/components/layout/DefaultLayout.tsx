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
      title: 'Docs',
      url: 'https://docs.unlock-protocol.com/',
    },
    {
      title: 'Libraries & Tools',
      url: 'https://docs.unlock-protocol.com/tools/',
    },
    {
      title: 'Code Examples',
      url: 'https://docs.unlock-protocol.com/tutorials',
    },
    {
      title: 'Video Tutorials',
      url: ' https://www.youtube.com/watch?v=ppYLt2GTeKA',
    },
    {
      title: 'Blog',
      url: 'https://unlock-protocol.com/blog',
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
            url: 'https://snapshot.org/#/unlock-protocol.eth',
          },
          {
            label: 'Tally',
            url: 'https://www.tally.xyz/gov/unlock',
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
