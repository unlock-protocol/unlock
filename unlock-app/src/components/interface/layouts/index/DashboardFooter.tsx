'use client'
import React from 'react'
import { EMAIL_SUBSCRIPTION_FORM } from '~/constants'
import { config } from '~/config/app'
import { Footer } from '@unlock-protocol/ui'

export const FOOTER = {
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
    url: config.unlockStaticUrl,
  },
  privacyUrl: `${config.unlockStaticUrl}/privacy`,
  termsUrl: `${config.unlockStaticUrl}/terms`,
  menuSections: [
    {
      title: 'About',
      options: [
        { label: 'About Unlock', url: `${config.unlockStaticUrl}/about` },
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
        { label: 'Blog', url: `${config.unlockStaticUrl}/blog` },
        { label: 'Events', url: `${config.unlockStaticUrl}/upcoming-events` },
        { label: 'Grants', url: `${config.unlockStaticUrl}/grants` },
      ],
    },
    {
      title: 'Resources',
      options: [
        { label: 'Docs', url: 'https://docs.unlock-protocol.com/' },
        { label: 'Developers', url: `${config.unlockStaticUrl}/developers` },
        { label: 'Guides', url: `${config.unlockStaticUrl}/blog` },
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

export default function DashboardFooter() {
  return <Footer {...FOOTER} />
}
