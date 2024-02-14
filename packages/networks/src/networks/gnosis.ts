import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const gnosis: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
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
      token: (address, holder) =>
        `https://gnosisscan.io/token/${address}?a=${holder}`,
      transaction: (hash) => `https://gnosisscan.io/tx/${hash}`,
    },
  },
  faucet: 'https://gnosisfaucet.com/',
  featured: true,
  governanceBridge: {
    connext: '0x5bB83e95f63217CDa6aE3D181BA580Ef377D2109',
    domainId: 6778479,
    modules: {
      connextMod: '0xdFB9328cF62e3525D355581dE88AeAa330879D12',
      delayMod: '0x6E74DC46EbF2cDB75B72Ab1dCAe3C98c7E9d28a1',
    },
  },
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
      {
        address: '0x5ff4d5733Cc2b0A069cFF409eCEad3C5C71Ee346',
        id: HookType.PROMO_CODE_CAPPED,
        name: 'Discount code with caps',
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
    endpoint:
      'https://api.studio.thegraph.com/query/65299/unlock-protocol-gnosis/version/latest',
    networkName: 'gnosis',
    studioName: 'unlock-protocol-gnosis',
  },
  tokens: [
    {
      address: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
      decimals: 6,
      featured: true,
      name: 'USD//C on xDai',
      symbol: 'USDC',
    },
    {
      address: '0x4ECaBa5870353805a9F068101A40E0f32ed605C6',
      decimals: 6,
      featured: true,
      name: 'Tether USD on xDai',
      symbol: 'USDT',
    },
  ],
  unlockAddress: '0x1bc53f4303c711cc693F6Ec3477B83703DcB317f',
  unlockDaoToken: {
    address: '0x8C84142c4a716a16a89d0e61707164d6107A9811',
    mainnetBridge: '0x41a4ee2855A7Dc328524babB07d7f505B201133e',
  },
  url: 'https://www.gnosis.io/',
}
export default gnosis
