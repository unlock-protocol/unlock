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
export const pageTitle = (title) => {
  let fullTitle = ''
  if (title) fullTitle += `${title} | `
  return `${fullTitle}Unlock: The Web's new business model`
}

export const MAX_DEVICE_WIDTHS = {
  PHONE: 736,
  TABLET: 1000,
  DESKTOP: false,
}
