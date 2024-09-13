import { ethers } from 'ethers'

export const EMAIL_SUBSCRIPTION_FORM = {
  portalId: '19942922',
  formGuid: '868101be-ae3e-422e-bc86-356c96939187',
}

export const ADDRESS_ZERO = ethers.ZeroAddress.toString()
/**
 * Returns a page title to be used within HTML <title> tags.
 * @param title
 * @returns {string}
 */
export const pageTitle = (title?: string): string => {
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

export const PAGE_DESCRIPTION =
  'Unlock is a protocol which enables creators to monetize their content with a few lines of code in a fully decentralized way.'

export const PAGE_DEFAULT_IMAGE =
  'https://unlock-protocol.com/static/images/pages/png/unlock-protocol-ogimage.png'

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

// mapping of min price by currency https://stripe.com/docs/currencies#minimum-and-maximum-charge-amounts
export const CREDIT_CARD_MIN_PRICE_BY_CURRENCY: Record<string, number> = {
  USD: 0.5,
  EUR: 0.5,
}

export const CREDIT_CARD_MIN_USD_PRICE = 0.5
export const INFINITY = '∞'
export const UNLIMITED_KEYS_COUNT = -1
export const UNLIMITED_KEYS_DURATION = -1
export const ONE_DAY_IN_SECONDS = 86400

export const MAX_UINT =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935'

// This represents an account that will never hold any keys. It's a bit of an
// ugly hack, but it allows us to initialize the paywall without asking a user
// to log in and without granting any unauthorized access.
export const DEFAULT_USER_ACCOUNT_ADDRESS =
  '0x0000000000000000000000000000000000000000'

// See
// https://docs.ethers.io/ethers.js/html/api-wallet.html#encrypted-json-wallets
// for available params; right now a custom value of scrypt/N covers our needs.
export const WALLET_ENCRYPTION_OPTIONS = {
  scrypt: {
    // web3 used 1 << 13, ethers default is 1 << 18. We want speedy wallet
    // decryption, and Unlock accounts should hold no currency so this tradeoff
    // is acceptable.

    N: 1 << 13,
  },
}

// We show unlimited renewals as if it's above this.
export const UNLIMITED_RENEWAL_LIMIT = 100000000000
