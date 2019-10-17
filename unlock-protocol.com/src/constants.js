/* eslint import/prefer-default-export: 0 */ // This file does not have a default export

/**
 * Returns a page title to be used within HTML <title> tags.
 * @param title
 * @returns {string}
 */
export const pageTitle = title => {
  let pageTitle = ''
  if (title) pageTitle += `${title} | `
  return (pageTitle += "Unlock: The Web's new business model")
}

export const PAGE_DESCRIPTION =
  'Unlock is a protocol which enables creators to monetize their content with a few lines of code in a fully decentralized way.'

export const PAGE_DEFAULT_IMAGE = '/static/images/pages/png/simple.png'

export const MAX_DEVICE_WIDTHS = {
  PHONE: 736,
  TABLET: 1000,
  DESKTOP: false,
}

export const GA_LABELS = {
  MEMBERSHIP: 'membership',
}

export const GA_ACTIONS = {
  UNLOCKED: 'unlockProtocol unlocked',
  LOCKED: 'unlockProtocol locked',
  MEMBERSHIP_BANNER_CLICKED: 'membership banner clicked',
}
