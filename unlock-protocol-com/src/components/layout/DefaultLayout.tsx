import { Footer } from '@unlock-protocol/ui'
import { ReactNode } from 'react'
import { EMAIL_SUBSCRIPTION_FORM } from '../../config/constants'
import { useMembership } from '../../hooks/useMembership'
import { Navigation } from '../interface/Navigation'

interface Props {
  children?: ReactNode | ReactNode[]
}

export function Layout({ children }: Props) {
  const { becomeMember } = useMembership()

  const FOOTER = {
    subscriptionForm: {
      description: 'Sign up for updates & fresh news about Unlock.',
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
    logoUrl: 'https://unlock-protocol.com/',
    privacyUrl: '/privacy',
    termsUrl: '/terms',
    actions: [
      {
        label: 'Launch App',
        url: 'https://staging-app.unlock-protocol.com/locks',
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
      <Navigation />
      {children}
      <div className="container px-6 py-4 mx-auto md:px-0 md:py-14 max-w-7xl">
        <Footer {...FOOTER} />
      </div>
    </>
  )
}
