import { HeaderNav } from './HeaderNav'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { CgArrowLongRight as ArrowRight } from 'react-icons/cg'

export default {
  component: HeaderNav,
  title: 'HeaderNav',
} as ComponentMeta<typeof HeaderNav>

const Template: ComponentStory<typeof HeaderNav> = (args) => (
  <div className="container mx-auto md:px-40">
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
      options: [
        {
          title: 'Test Embed Video',
          embed:
            '<iframe width="560" height="315" src="https://www.youtube.com/embed/FuDyzDYb_3E" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        },
        {
          title: 'Advent Calendar',
          embed:
            '<blockquote class="twitter-tweet" data-theme="dark"><p lang="en" dir="ltr">Want to build and deploy memberships and subscriptions using NFTs? <a href="https://twitter.com/CiaraNightingal?ref_src=twsrc%5Etfw">@CiaraNightingal</a> at <a href="https://twitter.com/thirdweb?ref_src=twsrc%5Etfw">@thirdweb</a> has just published a brilliant guide on how to do it. Check it. <a href="https://t.co/b3nJKXBPfV">https://t.co/b3nJKXBPfV</a></p>&mdash; Ʉnlock Protocol (@UnlockProtocol) <a href="https://twitter.com/UnlockProtocol/status/1600559098646638592?ref_src=twsrc%5Etfw">December 7, 2022</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>',
        },
      ],
    },
  ],
}
