import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const gnosis: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  bridge: {
    connext: '0x5bB83e95f63217CDa6aE3D181BA580Ef377D2109',
    domainId: 6778479,
  },
  chain: 'xdai',
  description:
    'Gnosis Chain is one of the first Ethereum sidechains and has stayed true to its values.',
  explorer: {
    name: 'Blockscout',
    urls: {
      address: (address) =>
        `https://gnosisscan.io/address/${address}/transactions`,
      base: `https://gnosisscan.io/`,
      token: (address, _holder) =>
        `https://gnosisscan.io/token/${address}/token-holders#holders`,
      transaction: (hash) => `https://gnosisscan.io/tx/${hash}`,
    },
  },
  faucet: 'https://gnosisfaucet.com/',
  featured: true,
  hooks: {
    onKeyPurchaseHook: [
      {
        address: '0x927D68eAE936Ec0111f01Fc4Ddd9cC57DB3f0Af2',
        id: HookType.PASSWORD,
        name: 'Password required',
      },
      {
        address: '0xFb0657eAE55A4dd3E2317C9eCB311bA5Ecc62C9C',
        id: HookType.CAPTCHA,
        name: 'Captcha',
      },
      {
        address: '0xe20738d9798B5B5801aEEFDB81d80Fcce3a3Aa95',
        id: HookType.GUILD,
        name: 'Guild',
      },
    ],
  },
  id: 100,
  isTestNetwork: false,
  keyManagerAddress: '0xBa81C9379AC1221BF8C100800dD0B0b0b048ba14',
  maxFreeClaimCost: 100,
  multisig: '0xfAC611a5b5a578628C28F77cEBDDB8C6159Ae79D',
  name: 'Gnosis Chain',
  nativeCurrency: {
    coinbase: 'DAI',
    coingecko: 'xdai',
    decimals: 18,
    name: 'xDAI',
    symbol: 'xDAI',
  },
  previousDeploys: [
    {
      startBlock: 14521200,
      unlockAddress: '0x14bb3586Ce2946E71B95Fe00Fc73dd30ed830863',
    },
  ],
  provider: 'https://rpc.unlock-protocol.com/100',
  publicLockVersionToDeploy: 13,
  publicProvider: 'https://rpc.gnosischain.com',
  startBlock: 19338700,
  // This is used in llama pricing API so can't rename.
  subgraph: {
    endpoint: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/xdai',
    endpointV2:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/gnosis-v2',
    networkName: 'xdai',
  },
  tokens: [
    {
      address: '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83',
      decimals: 6,
      name: 'USD Coin',
      symbol: 'USDC',
    },
    {
      address: '0x4ecaba5870353805a9f068101a40e0f32ed605c6',
      decimals: 6,
      name: 'Tether USD',
      symbol: 'USDT',
    },
  ],
  unlockAddress: '0x1bc53f4303c711cc693F6Ec3477B83703DcB317f',
  url: 'https://www.gnosis.io/',
}
export default gnosis
