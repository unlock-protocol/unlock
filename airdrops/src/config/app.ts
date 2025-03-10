/**
 * Configuration for the airdrops website
 */
const STATIC_SITE_URL = 'https://unlock-protocol.com'

export const config = {
  // Base URL for the airdrops website
  baseUrl: 'https://airdrops.unlock-protocol.com',

  // Static site URL
  staticSiteUrl: STATIC_SITE_URL,

  // Dashboard URL
  dashboardUrl: 'https://app.unlock-protocol.com',

  // App name and branding
  appName: {
    default: 'Airdrops',
    full: 'Unlock Airdrops',
    brand: 'Unlock Protocol',
  },

  // Metadata descriptions
  descriptions: {
    default:
      'The Unlock Protocol belongs to its community of creators, developers, and users. Contribute code, docs, or just use the protocol and claim UP tokens.',
  },

  // Images
  images: {
    default: `${STATIC_SITE_URL}/images/unlock.png`,
    thumbnail: `${STATIC_SITE_URL}/images/unlock.png`,
    favicon: '/favicon.ico',
  },

  // Social media handles
  social: {
    twitter: '@UnlockProtocol',
    github: 'unlock-protocol',
  },
}
