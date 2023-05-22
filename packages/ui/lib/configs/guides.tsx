import { Button, HeaderNav, Footer, unlockEmailSubscription } from '..'

const GUIDES_HEADER = {
  extraClass: {
    mobile: 'bg-[#fff7e9] px-6',
  },
  showSocialIcons: true,
  actions: [
    {
      content: <Button variant="outlined-primary">Launch App</Button>,
    },
  ],
  logo: {
    url: '/guides',
    domain: 'Guides',
  },
  menuSections: [
    {
      title: 'About Unlock',
      url: '/about',
    },
    {
      title: 'Devs',
      small: true,
      options: [
        {
          title: '',
          options: [
            {
              title: 'Documentation',
              url: 'https://docs.unlock-protocol.com/',
            },
            {
              title: 'Roadmap',
              url: 'https://docs.unlock-protocol.com/governance/roadmap/',
            },
          ],
        },
      ],
    },
  ],
}
const GUIDES_FOOTER = {
  subscriptionForm: {
    title: 'Sign up for Updates',
    description:
      'Receive fresh news about Unlock, including new features and opportunities to contribute',
    onSubmit: async (email: string) => {
      await unlockEmailSubscription(email)
    },
  },
  logo: {
    url: '/guides',
  },
  privacyUrl: `/privacy`,
  termsUrl: `/terms`,
  menuSections: [
    {
      title: 'About',
      options: [
        { label: 'About Unlock', url: `/about` },
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
        { label: 'Blog', url: `/blog` },
        { label: 'Events', url: `/upcoming-events` },
        { label: 'Grants', url: `/grants` },
      ],
    },
    {
      title: 'Resources',
      options: [
        { label: 'Docs', url: 'https://docs.unlock-protocol.com/' },
        { label: 'Developers', url: `/developers` },
        { label: 'Guides', url: `/guides` },
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

export const GuidesHeader = () => <HeaderNav {...GUIDES_HEADER} />
export const GuidesFooter = () => <Footer {...GUIDES_FOOTER} />
