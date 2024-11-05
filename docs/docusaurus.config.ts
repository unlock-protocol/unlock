import type { Config } from '@docusaurus/types'
import UnlockPrismTheme from './unlock-prism-theme'

const config: Config = {
  title: 'Unlock Protocol',
  tagline:
    'Unlock is a membership protocol, built on a blockchain. It enables creators to monetize their content or software without relying on a middleman. It lets consumers manage all of their subscriptions in a consistent way, as well as earn discounts when they share the best content and applications they use.',
  url: 'https://docs.unlock-protocol.com',
  baseUrl: '/',
  onBrokenLinks: 'log',
  onBrokenMarkdownLinks: 'throw',
  onDuplicateRoutes: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'unlock-protocol',
  projectName: 'docs',
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          docItemComponent: '@theme/ApiItem',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],
  themeConfig: {
    start_urls: ['https://docs.unlock-protocol.com'],
    sitemap_urls: ['https://docs.unlock-protocol.com/sitemap.xml'],
    algolia: {
      appId: 'J4FN2FD27Q',
      apiKey: '9bcefa2858ec26676689edd55f03fd26',
      indexName: 'unlock-protocol',
      contextualSearch: false,
      searchPagePath: false,
    },
    metadata: [
      {
        name: 'keywords',
        content:
          'unlock, blockchain, nft, token-gate, memberships, subscriptions, UP, UDT',
      },
      {
        property: 'og:locale',
        content: 'og:en_US',
      },
      {
        poperty: 'og:type',
        content: 'website',
      },
      {
        property: 'og:description',
        content:
          'Unlock Protocol technical documentation for developers with a complete protocol reference, tutorials and code examples.',
      },
      {
        property: 'og:title',
        content: 'Unlock Protocol Technical Docs',
      },
      {
        property: 'og:url',
        content: 'https://docs.unlock-protocol.com/',
      },
      {
        property: 'og:image',
        content: '/img/dev-docs-share-img.png',
      },
      {
        property: 'og:image:width',
        content: '1200',
      },
      {
        property: 'og:image:height',
        content: '627',
      },
      {
        property: 'og:image:type',
        content: 'image/png',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'Unlock Protocol Technical Docs',
      },
      {
        name: 'twitter:description',
        content:
          'Unlock Protocol technical documentation for developers with a complete protocol reference, tutorials and code examples.',
      },
      {
        name: 'twitter:image',
        content: '/img/dev-docs-share-img.png',
      },
      {
        name: 'twitter:image:alt',
        content: 'Unlock logo with the word docs next to it',
      },
      { name: 'docsearch:docusaurus_tag', content: 'current' },
    ],
    navbar: {
      title: 'Unlock',
      logo: {
        alt: 'Unlock Protocol',
        src: 'img/logo.svg',
        href: 'https://unlock-protocol.com/',
      },
      items: [
        { to: '/', label: 'Home', position: 'right' },
        {
          to: 'https://app.unlock-protocol.com/dashboard',
          label: 'Dashboard',
          position: 'right',
        },
        {
          to: '/core-protocol',
          label: 'Core Protocol',
          position: 'right',
        },
        { to: '/governance', label: 'Governance', position: 'right' },
        {
          href: 'https://github.com/unlock-protocol/unlock',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Overview',
              to: '/',
            },
            {
              label: 'Tools',
              to: '/tools',
            },
            {
              label: 'Tutorials',
              to: '/tutorials',
            },
            {
              label: 'Goverance',
              to: '/governance',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/unlock-protocol/unlock',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.unlock-protocol.com/',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/UnlockProtocol',
            },
            {
              label: 'Forum',
              href: 'https://unlock.community/',
            },
          ],
        },
        {
          title: 'About Unlock',
          items: [
            {
              label: 'About Unlock',
              to: 'https://unlock-protocol.com',
            },
            {
              label: 'Blog',
              to: 'https://app.unlock-protocol.com',
            },
            {
              label: 'Guides',
              to: 'https://unlock-protocol.com/guides',
            },
            {
              label: 'Brand kit',
              to: 'https://unlock-protocol.com/guides/#',
            },
          ],
        },
        {
          title: 'Unlock apps',
          items: [
            {
              label: 'Launch dashboard',
              to: 'https://app.unlock-protocol.com',
            },
            {
              label: 'Grants for developer',
              to: 'https://unlock-protocol.com/grants',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Unlock, Inc.`,
    },
    prism: {
      additionalLanguages: ['solidity'],
      theme: UnlockPrismTheme,
    },
  },

  plugins: [
    'docusaurus-node-polyfills',
    [
      require.resolve('docusaurus-gtm-plugin'),
      {
        id: 'GTM-PRCCFV9', // GTM Container ID
      },
    ],
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'openapi',
        docsPluginId: 'classic',
        config: {
          locksmith: {
            specPath: '../packages/unlock-js/openapi.yml',
            outputDir: 'docs/api/locksmith',
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
            },
          },
        },
      },
    ],
  ],
  themes: ['docusaurus-theme-openapi-docs'],
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
}

export default config
