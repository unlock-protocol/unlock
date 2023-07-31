// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const UnlockPrismTheme = require("./unlock-prism-theme");

/** @type {import('@docusaurus/core').Config} */
const config = {
  title: "Unlock Protocol",
  tagline:
    "Unlock is a membership protocol, built on a blockchain. It enables creators to monetize their content or software without relying on a middleman. It lets consumers manage all of their subscriptions in a consistent way, as well as earn discounts when they share the best content and applications they use.",
  url: "https://docs.unlock-protocol.com",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "throw",
  onDuplicateRoutes: "throw",
  favicon: "img/favicon.ico",
  organizationName: "unlock-protocol", // Usually your GitHub org/user name.
  projectName: "docs", // Usually your repo name.
  plugins: [
    'docusaurus-node-polyfills',
    [
      require.resolve("docusaurus-gtm-plugin"),
      {
        id: "GTM-PRCCFV9", // GTM Container ID
      },
    ],
    [
      "@docusaurus/plugin-client-redirects",
      {
        redirects: [
          {
            from: "/unlock/developers/sign-in-with-ethereum", //redirect sign in with ethereum
            to: "/tools/sign-in-with-ethereum/",
          },
          {
            from: "/unlock",
            to: "/",
          },
          {
            from: "/basics",
            to: "/",
          },
          {
            from: "/unlock/tools/locksmith/webhooks",
            to: "/tools/locksmith/webhooks",
          },
          {
            from: "/unlock/governance/roadmap",
            to: "/governance/roadmap",
          },
          {
            from: "/basics/new-to-unlock/unlock-accounts",
            to: "/tools/sign-in-with-ethereum/unlock-accounts",
          },
          {
            from: "/basics/unlock-accounts",
            to: "/tools/sign-in-with-ethereum/unlock-accounts",
          },
          {
            from: "/tools/paywall/sign-in-with-ethereum",
            to: "/tools/sign-in-with-ethereum/",
          },
          {
            from: "/new-to-web3/ethereum-architecture",
            to: "/getting-started/new-to-web3/ethereum-architecture",
          },
          {
            from: "/new-to-web3/",
            to: "/getting-started/new-to-web3/",
          },
          {
            from: "/new-to-web3/using-etherscan",
            to: "/getting-started/new-to-web3/using-etherscan",
          },
          {
            from: "/new-to-web3/what-is-a-crypto-wallet-a-guide-for-developers",
            to: "/getting-started/new-to-web3/what-is-a-crypto-wallet",
          },
          {
            from: "/new-to-web3/what-is-a-decentralised-application-aka-dapp",
            to: "/getting-started/new-to-web3/what-is-a-decentralised-application-aka-dapp",
          },
          {
            from: "/new-to-web3/what-is-a-smart-contract",
            to: "/getting-started/new-to-web3/what-is-a-smart-contract",
          },
          {
            from: "/new-to-web3/what-is-an-nft",
            to: "/getting-started/new-to-web3/what-is-an-nft",
          },
          {
            from: "/our-code-of-conduct",
            to: "/getting-started/our-code-of-conduct",
          },
          {
            from: "/litepaper",
            to: "/getting-started/what-is-unlock/litepaper",
          },
          {
            from: "/tutorials/backend-locking-with-express.js",
            to: "/tutorials/back-end/backend-locking-with-express.js",
          },
          {
            from: "/tutorials/ad-free-experience",
            to: "/tutorials/front-end/locking-page",
          },
          {
            from: "/tutorials/front-end/ad-free-experience",
            to: "/tutorials/front-end/locking-page",
          },
          {
            from: "/tutorials/front-end/locking-media-content",
            to: "/tutorials/front-end/locking-page"
          },
          {
            from: "/tutorials/locking-media-content",
            to: "/tutorials/front-end/locking-page",
          },
          {
            from: "/tutorials/react-example",
            to: "/tutorials/front-end/react-example",
          },
          {
            from: "/tutorials/using-subgraphs",
            to: "/tutorials/misc/using-subgraphs",
          },
          {
            from: "/tutorials/ethers",
            to: "/tutorials/smart-contracts/ethers",
          },
          {
            from: "/tutorials/smart-contracts/the-key-purchase-hook",
            to: "/tutorials/smart-contracts/hooks/the-key-purchase-hook",
          },
          {
            from: "/tutorials/smart-contracts/using-an-existing-nft-contract",
            to: "/tutorials/smart-contracts/hooks/using-an-existing-nft-contract",
          },
          {
            from: "/tutorials/the-key-purchase-hook",
            to: "/tutorials/smart-contracts/hooks/the-key-purchase-hook",
          },
          {
            from: "/tutorials/using-an-existing-nft-contract",
            to: "/tutorials/smart-contracts/hooks/using-an-existing-nft-contract",
          },
          {
            from: "/tutorials/using-unlock-in-other-contracts",
            to: "/tutorials/smart-contracts/using-unlock-in-other-contracts",
          },
          {
            from: "/core-protocol/deploying-locally/",
            to: "/tutorials/smart-contracts/deploying-locally",
          },
          {
            from: "/developers/unlock.js",
            to: "/tools/unlock.js",
          },
          {
            from: "/tools/entities",
            to: "/tools/subgraph/entities",
          },
          {
            from: "/tools/queries",
            to: "/tools/subgraph/queries",
          },
          {
            from: "/basics/deploying-a-lock",
            to: "/core-protocol/public-lock/deploying-locks"
          },
          {
            from: "/tools/paywall/configuring-checkout",
            to: "/tools/checkout/configuration"
          },
          {
            from: "/governance/grants-bounties-and-matchings",
            to: "/governance/grants-bounties/"
          }
        ],
      },
    ],
  ],
  presets: [
    [
      "docusaurus-preset-openapi",
      /** @type {import('docusaurus-preset-openapi').Options} */
      ({
        api: {
          sidebarCollapsed: false,
          path: "./openapi.yml",
          routeBasePath: "/api/locksmith",
        },
        docs: {
          showLastUpdateTime: false,
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          // editUrl: "https://github.com/unlock-protocol/docs/docs",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],


  themeConfig: {
    start_urls: [
      "https://docs.unlock-protocol.com"
    ],
    sitemap_urls: [
      "https://docs.unlock-protocol.com/sitemap.xml"
    ],
    algolia: {
      appId: "J4FN2FD27Q",
      apiKey: "9bcefa2858ec26676689edd55f03fd26",
      indexName: "unlock-protocol",
      contextualSearch: false,
      searchPagePath: false,
    },
    metadata: [
      {
        name: "keywords",
        content:
          "unlock, blockchain, nft, token-gate, memberships, subscriptions",
      },
      {
        property: "og:locale",
        content: "og:en_US",
      },
      {
        poperty: "og:type",
        content: "website",
      },
      {
        property: "og:description",
        content:
          "Unlock Protocol technical documentation for developers with a complete protocol reference, tutorials and code examples.",
      },
      {
        property: "og:title",
        content: "Unlock Protocol Technical Docs",
      },
      {
        property: "og:url",
        content: "https://docs.unlock-protocol.com/",
      },
      {
        property: "og:image",
        content: "/img/dev-docs-share-img.png",
      },
      {
        property: "og:image:width",
        content: "1200",
      },
      {
        property: "og:image:height",
        content: "627",
      },
      {
        property: "og:image:type",
        content: "image/png",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "Unlock Protocol Technical Docs",
      },
      {
        name: "twitter:description",
        content:
          "Unlock Protocol technical documentation for developers with a complete protocol reference, tutorials and code examples.",
      },
      {
        name: "twitter:image",
        content: "/img/dev-docs-share-img.png",
      },
      {
        name: "twitter:image:alt",
        content: "Unlock logo with the word docs next to it",
      },
      { name: 'docsearch:docusaurus_tag', content: 'current' }
    ],
    navbar: {
      title: "Unlock",
      logo: {
        alt: "Unlock Protocol",
        src: "img/logo.svg",
        href: "https://unlock-protocol.com/",
      },
      items: [
        { to: "/", label: "Home", position: "right" },
        {
          to: "https://app.unlock-protocol.com/dashboard",
          label: "Dashboard",
          position: "right",
        },
        { to: "/core-protocol", label: "Core Protocol", position: "right" },
        { to: "/governance", label: "Governance", position: "right" },
        {
          href: "https://github.com/unlock-protocol/unlock",
          label: "GitHub",
          position: "right",
        },
        {
          to: "https://unlock-protocol.gitbook.io/",
          label: "Older Docs",
          position: "right",
          rel: "nofollow,noindex",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Overview",
              to: "/",
            },
            {
              label: "Tools",
              to: "/tools",
            },
            {
              label: "Tutorials",
              to: "/tutorials",
            },
            {
              label: "Goverance",
              to: "/governance",
            },
            {
              label: "GitHub",
              href: "https://github.com/unlock-protocol/unlock",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Discord",
              href: "https://discord.com/invite/Ah6ZEJyTDp",
            },
            {
              label: "Twitter",
              href: "https://twitter.com/UnlockProtocol",
            },
            {
              label: "Forum",
              href: "https://unlock.community/",
            },
          ],
        },
        {
          title: "About Unlock",
          items: [
            {
              label: "About Unlock",
              to: "https://unlock-protocol.com",
            },
            {
              label: "Blog",
              to: "https://app.unlock-protocol.com",
            },
            {
              label: "Guides",
              to: "https://unlock-protocol.com/guides",
            },
            {
              label: "Brand kit",
              to: "https://unlock-protocol.com/guides/#",
            },
          ],
        },
        {
          title: "Unlock apps",
          items: [
            {
              label: "Launch dashboard",
              to: "https://app.unlock-protocol.com",
            },
            {
              label: "Grants for developer",
              to: "https://unlock-protocol.com/grants",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Unlock, Inc.`,
    },
    prism: {
      additionalLanguages: ["solidity"],
      theme: UnlockPrismTheme,
    }
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
};

module.exports = config;
