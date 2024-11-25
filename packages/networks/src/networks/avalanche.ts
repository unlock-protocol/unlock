import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const avalanche: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'avax',
  description:
    'Avalanche is an open, programmable smart contracts platform for decentralized applications.',
  explorer: {
    name: 'Snowtrace (Avalanche)',
    urls: {
      address: (address) => `https://snowtrace.io/address/${address}`,
      base: `https://snowtrace.io/`,
      token: (address, holder) =>
        `https://snowtrace.io/token/${address}?a=${holder}`,
      transaction: (hash) => `https://snowtrace.io/tx/${hash}`,
    },
  },
  featured: false,
  hooks: {
    onKeyPurchaseHook: [
      {
        address: '0x2499D94880B30fA505543550ac8a1e24cfFeFe78',
        id: HookType.CAPTCHA,
        name: 'Captcha',
      },
      {
        address: '0x58D86Dc056c442867485941FeBeA8D3bB4657eAC',
        id: HookType.PASSWORD,
        name: 'Password required',
      },
      {
        address: '0x520294E736167303efa038205D4391b58261BC9c',
        id: HookType.PROMO_CODE_CAPPED,
        name: 'Discount code with caps',
      },
      {
        address: '0xa396CFB1fFe3ADD2308dF140aa2d0A520D5c6c31',
        id: HookType.PASSWORD_CAPPED,
        name: 'Passwords with caps. Multiple passwords can be used per contract',
      },
      {
        address: '0xF498a07cac92DA348E4E9F05865025aE51e9fcfa',
        id: HookType.ALLOW_LIST,
        name: 'Allow List',
      },
    ],
    onTokenURIHook: [
      {
        address: '0x927D68eAE936Ec0111f01Fc4Ddd9cC57DB3f0Af2',
        id: HookType.ADVANCED_TOKEN_URI,
        name: 'Advanced Token URI',
      },
    ],
  },
  id: 43114,
  isTestNetwork: false,
  keyManagerAddress: '0x8e0B46ec3B95c81355175693dA0083b00fCc1326',
  maxFreeClaimCost: 1,
  multisig: '0xEc7777C51327917fd2170c62873272ea168120Cb',
  name: 'Avalanche (C-Chain)',
  nativeCurrency: {
    coingecko: 'avalanche-2',
    decimals: 18,
    name: 'AVAX',
    symbol: 'AVAX',
  },
  opensea: {
    collectionUrl: (lockAddress) =>
      `https://opensea.io/assets/avalanche/${lockAddress}`,
    tokenUrl: (_lockAddress, _tokenId) =>
      `https://opensea.io/assets/avalanche/${_lockAddress}/${_tokenId}`,
  },
  previousDeploys: [],
  provider: 'https://rpc.unlock-protocol.com/43114',
  publicLockVersionToDeploy: 14,
  publicProvider: 'https://api.avax.network/ext/bc/C/rpc',
  startBlock: 17188332,
  subgraph: {
    endpoint: 'https://subgraph.unlock-protocol.com/43114',
    graphId: '8cLuGXsVcgmeEsaekRgKeWwF4nKahugK1VFKkTckTHmj',
    studioName: 'unlock-protocol-avalanche',
  },
  tokens: [
    {
      address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
      decimals: 6,
      featured: true,
      name: 'USD Coin',
      symbol: 'USDC',
    },
    {
      address: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
      decimals: 18,
      featured: true,
      name: 'Wrapped Ether',
      symbol: 'WETH.e',
    },
    {
      address: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
      decimals: 6,
      name: 'USD Coin',
      symbol: 'USDC.e',
    },
    {
      address: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',
      decimals: 6,
      featured: true,
      name: 'Tether USD',
      symbol: 'USDT.e',
    },
    {
      address: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
      decimals: 18,
      featured: true,
      name: 'Dai Stablecoin',
      symbol: 'DAI.e',
    },
    {
      address: '0x50b7545627a5162F82A992c33b87aDc75187B218',
      decimals: 8,
      featured: true,
      name: 'Wrapped BTC',
      symbol: 'WBTC.e',
    },
  ],
  uniswapV3: {
    factoryAddress: '0x740b1c1de25031C31FF4fC9A62f554A55cdC1baD',
    positionManager: '0x655C406EBFa14EE2006250925e54ec43AD184f8B',
    universalRouterAddress: '0x4Dae2f939ACf50408e13d58534Ff8c2776d45265',
  },
  unlockAddress: '0x70cBE5F72dD85aA634d07d2227a421144Af734b3',
  url: 'https://www.avalabs.org/',
}

export default avalanche
