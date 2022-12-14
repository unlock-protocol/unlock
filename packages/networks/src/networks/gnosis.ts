import { NetworkConfig } from '@unlock-protocol/types'

export const gnosis: NetworkConfig = {
  publicProvider: 'https://rpc.gnosischain.com',
  provider: 'https://rpc.unlock-protocol.com/100',
  unlockAddress: '0x1bc53f4303c711cc693F6Ec3477B83703DcB317f',
  serializerAddress: '0x646E373EAf8a4AEc31Bf62B7Fd6fB59296d6CdA9',
  multisig: '0xfAC611a5b5a578628C28F77cEBDDB8C6159Ae79D',
  id: 100,
  name: 'Gnosis Chain',
  blockTime: 5000,
  chain: 'xdai', // This is used in llama pricing API so can't rename.
  requiredConfirmations: 12,
  subgraph: {
    endpoint: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/xdai',
    endpointV2:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/gnosis-v2',
  },
  explorer: {
    name: 'Blockscout',
    urls: {
      base: `https://gnosisscan.io/`,
      address: (address) =>
        `https://gnosisscan.io/address/${address}/transactions`,
      transaction: (hash) => `https://gnosisscan.io/tx/${hash}`,
      token: (address, _holder) =>
        `https://gnosisscan.io/token/${address}/token-holders#holders`,
    },
  },
  opensea: {
    tokenUrl: (_lockAddress, _tokenId) => null,
  },
  erc20: null, // no default ERC20 on xdai for now
  locksmithUri: 'https://locksmith.unlock-protocol.com',
  baseCurrencySymbol: 'DAI',
  nativeCurrency: {
    name: 'DAI',
    symbol: 'DAI',
    decimals: 18,
    coingecko: 'xdai',
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
  maxFreeClaimCost: 100,
  teamMultisig: '0xfAC611a5b5a578628C28F77cEBDDB8C6159Ae79D',
  tokens: [
    {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      address: '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83',
    },
    {
      name: 'Tether USD',
      decimals: 6,
      address: '0x4ecaba5870353805a9f068101a40e0f32ed605c6',
      symbol: 'USDT',
    },
  ],
}
export default gnosis
