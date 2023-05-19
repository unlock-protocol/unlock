import { Button, HeaderNav, Footer } from '..'

const SHOWCASE_HEADER = {
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
    url: '/',
    domain: 'Showcase',
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

const SHOWCASE_FOOTER = {
  subscriptionForm: {
    title: 'Sign up for Updates',
    description:
      'Receive fresh news about Unlock, including new features and opportunities to contribute',
    onSubmit: async (email: string) => {
      const EMAIL_SUBSCRIPTION_FORM = {
        portalId: '19942922',
        formGuid: '868101be-ae3e-422e-bc86-356c96939187',
      }

      const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${EMAIL_SUBSCRIPTION_FORM.portalId}/${EMAIL_SUBSCRIPTION_FORM.formGuid}`
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
