import { HeaderNav } from './HeaderNav'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { CgArrowLongRight as ArrowRight } from 'react-icons/cg'

export default {
  component: HeaderNav,
  title: 'HeaderNav',
} as ComponentMeta<typeof HeaderNav>

const Template: ComponentStory<typeof HeaderNav> = (args) => (
  <div className="container mx-auto">
    <HeaderNav {...args} />
  </div>
)

export const Normal = Template.bind({})

Normal.args = {
  extraClass: {
    mobile: 'px-6',
  },
  logo: {
    url: 'https://unlock-protocol.com/',
  },
  actions: [
    {
      title: 'Launch App',
      url: 'https://app.unlock-protocol.com',
      icon: ArrowRight,
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
            { title: 'Unlock Smart Contracts', url: 'https://google.it' },
            { title: 'Deploying Locks', url: 'https://google.it' },
            { title: 'Hooks', url: 'https://google.it' },
          ],
        },
        {
          title: 'Integrations',
          options: [
            {
              title: 'Shopify',
              url: 'https://google.it',
            },
            {
              title: 'Discourse',
              url: 'https://google.it',
            },
            {
              title: 'Guild.xyz',
              url: 'https://google.it',
            },
            {
              title: 'Wordpress',
              url: 'https://google.it',
            },
          ],
        },
        {
          title: 'Tools',
          options: [
            {
              title: 'Building token gated applications',
              url: 'https://google.it',
            },
            {
              title: 'Sign in with Ethereum',
              url: 'https://google.it',
            },
            {
              title: 'Webhooks',
              url: 'https://google.it',
            },
            {
              title: 'Subgraph',
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
              title: 'How to sell membership NFT',
              url: 'https://google.it',
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
      size: 'small',
      options: [
        {
          title: '',
          options: [
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
}
