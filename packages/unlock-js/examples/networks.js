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

const { gnosis, polygon } = require('@unlock-protocol/networks')

module.exports = {
  100: {
    unlockAddress: gnosis.unlockAddress,
    provider: gnosis.provider,
  },
  137: {
    unlockAddress: polygon.unlockAddress,
    provider: polygon.publicProvider,
  },
}
