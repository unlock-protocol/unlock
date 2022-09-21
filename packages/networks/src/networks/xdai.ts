import { NetworkConfig } from '@unlock-protocol/types'

export const xdai: NetworkConfig = {
  publicProvider: 'https://rpc.gnosischain.com',
  provider: 'https://rpc.unlock-protocol.com/100',
  unlockAddress: '0x1bc53f4303c711cc693F6Ec3477B83703DcB317f',
  serializerAddress: '0x646E373EAf8a4AEc31Bf62B7Fd6fB59296d6CdA9',
  multisig: '0xfAC611a5b5a578628C28F77cEBDDB8C6159Ae79D',
  id: 100,
  name: 'Gnosis Chain',
  blockTime: 5000,
  requiredConfirmations: 12,
  subgraphURI: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/xdai',
  explorer: {
    name: 'Blockscout',
    urls: {
      address: (address) =>
        `https://blockscout.com/poa/xdai/address/${address}/transactions`,
      transaction: (hash) => `https://blockscout.com/poa/xdai/tx/${hash}`,
      token: (address, _holder) =>
        `https://blockscout.com/xdai/mainnet/token/${address}/token-holders#holders`,
    },
  },
  opensea: {
    tokenUrl: (_lockAddress, _tokenId) => null,
  },
  erc20: null, // no default ERC20 on xdai for now
  locksmithUri: 'https://locksmith.unlock-protocol.com',
  baseCurrencySymbol: 'xDai',
  nativeCurrency: {
    name: 'xDAI',
    symbol: 'xDai',
    decimals: 18,
  },
  startBlock: 19338700,
  previousDeploys: [
    {
      unlockAddress: '0x14bb3586Ce2946E71B95Fe00Fc73dd30ed830863',
      startBlock: 14521200,
    },
  ],
  description:
    'EVM compatible network whose base currency is a stable coin. Cheaper transaction cost.',
  isTestNetwork: false,
  teamMultisig: '0xfAC611a5b5a578628C28F77cEBDDB8C6159Ae79D',
  // 0xddafbb505ad214d7b80b1f830fccc89b60fb7a83
  tokens: [
    {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      address: '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83',
    },
  ],
}
export default xdai
