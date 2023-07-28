import { Link } from '~/components/Link/Link'
import { Button, HeaderNav, Footer, unlockEmailSubscription } from '..'

const SHOWCASE_HEADER = {
  extraClass: {
    mobile: 'bg-[#fff7e9] px-6',
  },
  showSocialIcons: true,
  actions: [
    {
      content: (
        <Link href="https://app.unlock-protocol.com/locks">
          <Button variant="outlined-primary">Launch App</Button>
        </Link>
      ),
    },
  ],
  logo: {
    url: '/',
    domain: 'Showcase',
  },
  menuSections: [
    {
      title: 'About Unlock',
      url: 'https://unlock-protocol.com/about',
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

const SHOWCASE_FOOTER = {
  subscriptionForm: {
    title: 'Sign up for Updates',
    description:
      'Receive fresh news about Unlock, including new features and opportunities to contribute',
    onSubmit: async (email: string) => {
      await unlockEmailSubscription(email)
    },
  },
  logo: {
    url: '/',
  },
  privacyUrl: `https://unlock-protocol.com/privacy`,
  termsUrl: `https://unlock-protocol.com/terms`,
  menuSections: [
    {
      title: 'About',
      options: [
        { label: 'About Unlock', url: `https://unlock-protocol.com/about` },
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
        { label: 'Showcase', url: '/' },
        { label: 'Blog', url: `https://unlock-protocol.com/blog` },
        {
          label: 'Upcoming Events',
          url: `https://unlock-protocol.com/upcoming-events`,
        },
        { label: 'Grants', url: `https://unlock-protocol.com/grants` },
      ],
    },
    {
      title: 'Resources',
      options: [
        { label: 'Docs', url: 'https://docs.unlock-protocol.com/' },
        { label: 'Developers', url: `https://unlock-protocol.com/developers` },
        { label: 'Guides', url: `https://unlock-protocol.com/guides` },
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

export const ShowcaseHeader = () => <HeaderNav {...SHOWCASE_HEADER} />
export const ShowcaseFooter = () => <Footer {...SHOWCASE_FOOTER} />
