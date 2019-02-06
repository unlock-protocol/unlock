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
  1984: ['Winston', 'test'],
}

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

/**
 * Transaction types
 */
export const TRANSACTION_TYPES = {
  LOCK_CREATION: 'LOCK_CREATION',
  KEY_PURCHASE: 'KEY_PURCHASE',
  WITHDRAWAL: 'WITHDRAWAL',
  UPDATE_KEY_PRICE: 'UPDATE_KEY_PRICE',
}

/**
 * This regexp matches several important parameters passed in the url for the demo and paywall pages.
 *
 * '/demo/0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9/'
 *   will extract 'demo' and the lock address as match 1 and 2
 * '/demo/0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9/http%3A%2F%2Fexample.com'
 *   will extract the same variables, and also the url-encoded redirect URL 'http://example.com' as match 4
 * '/paywall/0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9/#0xabcddc4CdBda8dc99c82D66d97B264386E41c0E9'
 *   will extract the 'paywall' and lock address as match 1 and 2 and the account address as match 6
 *
 * You should not use this directly, instead use the utils/routes.js lockRoute function
 */
export const LOCK_PATH_NAME_REGEXP = /\/([a-z0-9]+)\/(0x[a-fA-F0-9]{40})(\/([^#]+))?(#(0x[a-fA-F0-9]{40}))?/
/**
 * Matches any valid ethereum account address
 */
export const ACCOUNT_REGEXP = /0x[a-fA-F0-9]{40}/

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

// constants related to pagination
export const PGN_ITEMS_PER_PAGE = 5
export const PGN_MAX_NUMBER_OF_PAGES_TO_SHOW_ALL = 10

export const MAX_DEVICE_WIDTHS = {
  PHONE: 736,
  TABLET: 1000,
  DESKTOP: false,
}

export const INFINITY = '∞'
export const UNLIMITED_KEYS_COUNT = -1

export const SHOW_FLAG_FOR = 2000 // milliseconds

export const MAX_UINT =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935'

// the number of ms between checking for account changes in walletService
export const POLLING_INTERVAL = 500
