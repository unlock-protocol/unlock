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
      small: true,
      options: [
        {
          title: '',
          options: [
            // {
            //  title: 'State of Unlock',
            //  url: 'https://unlock-protocol.com/state',
            // },
            //
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
      url: 'https://app.unlock-protocol.com/locks',
      icon: ArrowRight,
    },
  ],
}
