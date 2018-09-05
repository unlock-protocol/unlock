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
 * Links to all icon files are available as GLYPHS
 */
const req = require.context('../public/images/icons', false, /^\.\/.*\.svg$/)
export const GLYPHS = (req.keys()).reduce((glyphs, key) => {
  const filename = key.match(new RegExp(/[^/]+(?=\.svg$)/))[0]
  return Object.assign({}, glyphs, { [filename]: req(key) })
}, {})
