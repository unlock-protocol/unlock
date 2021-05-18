/**
 * Configurations: both Web3Service and WalletService expect to be passed network configurations of the following form:
 * {
 *   [id]: {
 *      provider: string, // (URL of an RPC provider)
 *      unlockAddress: string // (Address of the Unlock contract deployed on corresponding chain id)
 *   }
 * }
 *
 * As of writing, we have the following deployments:
 * Unlock Contract:
 * mainnet: 0x3d5409cce1d45233de1d4ebdee74b8e004abdd13
 * rinkeby: 0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b
 * xdai: 0x14bb3586Ce2946E71B95Fe00Fc73dd30ed830863
 */

module.exports = {
  4: {
    provider:
      'https://eth-rinkeby.alchemyapi.io/v2/n0NXRSZ9olpkJUPDLBC00Es75jaqysyT',
    unlockAddress: '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b',
  },
}
