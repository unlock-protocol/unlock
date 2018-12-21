/* eslint import/prefer-default-export: 0 */ // This file does not have a default export

/**
 * Pair of network name and 'class' (dev, test, staging, main)
 * Taken from https://ethereum.stackexchange.com/questions/17051/how-to-select-a-network-id-or-is-there-a-list-of-network-ids
 */
export const ETHEREUM_NETWORKS_NAMES = {
  0: ['Olympic', 'main'],
  1: ['Mainnet', 'main'],
  2: ['Morden', 'staging'],
  3: ['Ropsten', 'staging'],
  4: ['Rinkeby', 'staging'],
}

/**
 * Returns a page title to be used within HTML <title> tags.
 * @param title
 * @returns {string}
 */
export const pageTitle = title => {
  let pageTitle = ''
  if (title) pageTitle += `${title} | `
  return (pageTitle += 'Unlock: The Web\'s new business model')
}

/**
 * Transaction types
 */
export const TRANSACTION_TYPES = {
  LOCK_CREATION: 'LOCK_CREATION',
  KEY_PURCHASE: 'KEY_PURCHASE',
  WITHDRAWAL: 'WITHDRAWAL',
}

/**
 * Matches /lock /demo or /paywall
 */
export const LOCK_PATH_NAME_REGEXP = /\/[a-z0-9]+\/(0x[a-fA-F0-9]{40}).*/

export const PAGE_DESCRIPTION =
  'Unlock is a protocol which enables creators to monetize their content with a few lines of code in a fully decentralized way.'

export const PAGE_DEFAULT_IMAGE =
  'https://unlock-protocol.com/static/images/pages/png/simple.png'

export const CANONICAL_BASE_URL = 'https://unlock-protocol.com' // Leave trailing slash off

export const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
