import Header from './Header'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { CgArrowLongRight as ArrowRight } from 'react-icons/cg'

export default {
  component: Header,
  title: 'Header',
} as ComponentMeta<typeof Header>

const Template: ComponentStory<typeof Header> = (args) => <Header {...args} />

export const Normal = Template.bind({})

Normal.args = {
  actions: [
    {
      label: 'Launch App',
      url: 'https://app.unlock-protocol.com',
      icon: ArrowRight,
    },
    {
      label: 'Test',
      url: 'https://app.unlock-protocol.com',
    },
  ],
  menuSections: [
    {
      title: 'Devs',
      options: [
        {
          title: 'Watch Tutorials',
          src: 'https://i.ytimg.com/vi/mq7xYFWe_yw/maxresdefault.jpg',
          url: 'https://google.it',
        },
        {
          title: 'Core Protocol',
          options: [
            { label: 'Unlock Smart Contracts', url: 'https://google.it' },
            { label: 'Deploying Locks', url: 'https://google.it' },
            { label: 'Hooks', url: 'https://google.it' },
          ],
        },
        {
          title: 'Integrations',
          options: [
            {
              label: 'Shopify',
              url: 'https://google.it',
            },
            {
              label: 'Discourse',
              url: 'https://google.it',
            },
            {
              label: 'Guild.xyz',
              url: 'https://google.it',
            },
            {
              label: 'Wordpress',
              url: 'https://google.it',
            },
          ],
        },
        {
          title: 'Tools',
          options: [
            {
              label: 'Building token gated applications',
              url: 'https://google.it',
            },
            {
              label: 'Sign in with Ethereum',
              url: 'https://google.it',
            },
            {
              label: 'Webhooks',
              url: 'https://google.it',
            },
            {
              label: 'Subgraph',
              url: 'https://google.it',
            },
          ],
        },
      ],
    },
    {
      title: 'Creator ',
      options: [
        {
          title: 'Create Digital Collectibles with Unlock Protocol',
          src: 'https://i.ytimg.com/vi/mq7xYFWe_yw/maxresdefault.jpg',
          url: 'https://google.it',
        },
        {
          title: 'How to Sell NFT Tickets for an Event',
          src: 'https://i.ytimg.com/vi/mq7xYFWe_yw/maxresdefault.jpg',
          url: 'https://google.it',
        },
        {
          title: 'Recurring Memberships',
          src: 'https://i.ytimg.com/vi/mq7xYFWe_yw/maxresdefault.jpg',
          url: 'https://google.it',
        },
        {
          title: 'Articles for you',
          options: [
            {
              label: 'How to sell membership NFT',
              url: 'https://google.it',
            },
          ],
        },
      ],
    },
    {
      title: 'Showcase',
      options: [
        {
          title: 'How to Sell NFT Tickets for an Event',
          src: 'https://i.ytimg.com/vi/mq7xYFWe_yw/maxresdefault.jpg',
          url: 'https://google.it',
        },
        {
          title: 'Test',
          options: [
            {
              label: 'test',
              url: 'https://google.it',
            },
          ],
        },
        {
          title: 'Create Digital Collectibles with Unlock Protocol',
          src: 'https://i.ytimg.com/vi/mq7xYFWe_yw/maxresdefault.jpg',
          url: 'https://google.it',
        },
        {
          title: 'Articles for you',
          options: [
            {
              label: 'How to sell membership NFT',
              url: 'https://google.it',
            },
          ],
        },
      ],
    },
    {
      title: 'Blog',
      options: [
        {
          title: 'Test',
          options: [
            {
              label: 'test',
              url: 'https://google.it',
            },
          ],
        },
      ],
    },
    {
      title: 'More',
      options: [
        {
          title: 'Test',
          options: [
            {
              label: 'test',
              url: 'https://google.it',
            },
          ],
        },
      ],
    },
  ],
}
