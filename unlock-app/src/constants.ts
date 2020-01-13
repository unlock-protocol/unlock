/* eslint import/prefer-default-export: 0 */ // This file does not have a default export

/**
 * Pair of network name and 'class' (dev, test, staging, main)
 * Taken from https://ethereum.stackexchange.com/questions/17051/how-to-select-a-network-id-or-is-there-a-list-of-network-ids
 */
export const ETHEREUM_NETWORKS_NAMES: { [id: number]: string[] } = {
  0: ['Olympic', 'main'],
  1: ['Mainnet', 'main'],
  2: ['Morden', 'staging'],
  3: ['Ropsten', 'staging'],
  4: ['Rinkeby', 'staging'],
  42: ['Kovan', 'staging'],
  1984: ['Winston', 'test'],
}

/**
 * Returns a page title to be used within HTML <title> tags.
 * @param title
 * @returns {string}
 */
export const pageTitle = (title: string) => {
  let pageTitle = ''
  if (title) pageTitle += `${title} | `
  return (pageTitle += "Unlock: The Web's new business model")
}

// used in defining the helpers for LOCK_PATH_NAME_REGEXP and ACCOUNT_REGEXP
const accountRegex = '0x[a-fA-F0-9]{40}'

/**
 * Matches any valid ethereum account address
 */
export const ACCOUNT_REGEXP = new RegExp(`^${accountRegex}$`)

// helpers for the LOCK_PATH_NAME_REGEXP
const prefix = '[a-z0-9]+'
const urlEncodedRedirectUrl = '[^#?]+'
const userAccount = accountRegex
const lockAddress = accountRegex

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
export const LOCK_PATH_NAME_REGEXP = new RegExp(
  `/(${prefix})/(${lockAddress})` +
    // either "/urlEncodedRedirectUrl/#account" or just "#account" and these are all optional
    // note that "/#account" as in "/paywall/<lockaddress>/#<useraccount>" is also matched
    `(?:/(${urlEncodedRedirectUrl}))?(?:/?#(${userAccount}))?`
)

export const PAGE_DESCRIPTION =
  'Unlock is a protocol which enables creators to monetize their content with a few lines of code in a fully decentralized way.'

export const PAGE_DEFAULT_IMAGE =
  'https://unlock-protocol.com/static/images/pages/png/simple.png'

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

export const MAX_DEVICE_WIDTHS = {
  PHONE: 736,
  TABLET: 1000,
  DESKTOP: false,
}

export const INFINITY = '∞'
export const UNLIMITED_KEYS_COUNT = -1

// oneHundredYearsInDays -- based on the calculation for max duration in smart contract.
export const ONE_HUNDRED_YEARS_IN_DAYS = 100 * 365

export const SHOW_FLAG_FOR = 2000 // milliseconds

export const MAX_UINT =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935'

// the number of ms between checking for account changes in walletService
export const ACCOUNT_POLLING_INTERVAL = 2000

export const CURRENCY_CONVERSION_MIDDLEWARE_RETRY_INTERVAL = 10000

export const USER_ACCOUNT_ADDRESS_STORAGE_ID = 'managedUserAccountAddress'

// This represents an account that will never hold any keys. It's a bit of an
// ugly hack, but it allows us to initialize the paywall without asking a user
// to log in and without granting any unauthorized access.
export const DEFAULT_USER_ACCOUNT_ADDRESS =
  '0x0000000000000000000000000000000000000000'
