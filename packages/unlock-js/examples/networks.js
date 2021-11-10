/**
 * Configurations: both Web3Service and WalletService expect to be passed network configurations of the following form:
 * {
 *   [id]: {
 *      provider: string, // (URL of an RPC provider)
 *      unlockAddress: string // (Address of the Unlock contract deployed on corresponding chain id)
 *   }
 * }
 *
 */

// eslint-disable-next-line import/no-extraneous-dependencies
const { rinkeby, xdai } = require('@unlock-protocol/networks')

module.exports = {
  4: {
    unlockAddress: rinkeby.unlockAddress,
    provider: rinkeby.provider,
  },
  100: {
    unlockAddress: xdai.unlockAddress,
    provider: xdai.provider,
  },
}
