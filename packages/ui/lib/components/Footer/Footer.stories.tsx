import { Footer } from './Footer'
import { Meta, StoryObj } from '@storybook/react'

const meta = {
  component: Footer,
  title: 'Footer',
} satisfies Meta<typeof Footer>

export default meta
type Story = StoryObj<typeof meta>

export const Normal = {
  args: {
    logo: {
      url: 'https://unlock-protocol.com/',
    },
    actions: [
      { label: 'Launch App', url: 'https://app.unlock-protocol.com' },
      {
        label: 'Get Unlock Membership',
        onClick: () => {
          // do custom things here 👈
        },
      },
    ],
    subscriptionForm: {
      // example of implementation when form is submitted
      title: 'Sign up for Updates',
      description:
        'Receive fresh news about Unlock, including new features and opportunities to contribute',
      onSubmit: async (email: string) => {
        const endpoint = `https://example.it`
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
    termsUrl: 'https://example.it',
    privacyUrl: 'https://example.it',
    menuSections: [
      {
        title: 'About',
        options: [
          { label: 'About Unlock', url: '' },
          { label: 'Roadmap', url: '' },
          { label: 'Careers', url: '' },
        ],
      },
      {
        title: 'Governance',
        options: [
          { label: 'Unlock DAO', url: '' },
          { label: 'Forum', url: '' },
          { label: 'Snapshot', url: '' },
        ],
      },
      {
        title: 'Community',
        options: [
          { label: 'Showcase', url: '' },
          { label: 'State of Unlock', url: '' },
          { label: 'Blog', url: '' },
          { label: 'Events', url: '' },
          { label: 'Grants', url: '' },
        ],
      },
      {
        title: 'Resources',
        options: [
          { label: 'Docs', url: '' },
          { label: 'Developers', url: '' },
          { label: 'Guides', url: '' },
          { label: 'Integrations', url: '' },
          { label: 'Media kit', url: '' },
        ],
      },
    ],
  },
} satisfies Story
