import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const sepolia: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'sepolia',
  description:
    'Sepolia is the primary testnet recommended by the Ethereum community for dapp development.',
  explorer: {
    name: 'Sepolia Etherscan',
    urls: {
      address: (address: string) =>
        `https://sepolia.etherscan.io/address/${address}`,
      base: `https://sepolia.etherscan.io/`,
      token: (address: string, holder: string) =>
        `https://sepolia.etherscan.io/token/${address}?a=${holder}`,
      transaction: (hash: string) => `https://sepolia.etherscan.io/tx/${hash}`,
    },
  },
  featured: true,
  fullySubsidizedGas: true,
  hooks: {
    onKeyPurchaseHook: [
      {
        address: '0x34EbEc0AE80A2d078DE5489f0f5cAa4d3aaEA355',
        id: HookType.PASSWORD,
        name: 'Password required',
      },
      {
        address: '0xd0b14797b9D08493392865647384974470202A78',
        id: HookType.CAPTCHA,
        name: 'Captcha',
      },
      {
        address: '0x6878Ae3c863f6Ebd27B47C02F6B32aAC8B0BA07E',
        id: HookType.GUILD,
        name: 'Guild',
      },
      {
        address: '0x639143cbf90F27eA5Ce4b3A7D869d4D7878009A5',
        id: HookType.PROMOCODE,
        name: 'Discount code',
      },
      {
        address: '0x0aC1a84AcaB08b630714d59dA74576D7274E68d5',
        id: HookType.PROMO_CODE_CAPPED,
        name: 'Discount code with caps',
      },
    ],
  },
  id: 11155111,
  isTestNetwork: true,
  keyManagerAddress: '0x338b1f296217485bf4df6CE9f93ab4C73F72b57D',
  maxFreeClaimCost: 1000,
  multisig: '0x95fE514fe7F60722AFF0FD009ebeE4Ba2013924c',
  name: 'Sepolia',
  nativeCurrency: {
    coingecko: 'ethereum',
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },

  opensea: {
    collectionUrl: (lockAddress) =>
      `https://testnets.opensea.io/assets/sepolia/${lockAddress}`,
    tokenUrl: (_lockAddress, _tokenId) =>
      `https://testnets.opensea.io/assets/sepolia/${_lockAddress}/${_tokenId}`,
  },

  previousDeploys: [],

  provider: 'https://rpc.unlock-protocol.com/11155111',

  publicLockVersionToDeploy: 13,

  publicProvider: 'https://rpc2.sepolia.org/',

  startBlock: 4381710,
  subgraph: {
    endpoint:
      'https://api.studio.thegraph.com/query/65299/unlock-protocol-sepolia/version/latest',
    networkName: 'sepolia',
    studioName: 'unlock-protocol-sepolia',
  },
  tokens: [
    {
      address: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
      decimals: 18,
      featured: true,
      mainnetAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      name: 'Wrapped Ether',
      symbol: 'WETH',
    },
    {
      address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      decimals: 6,
      featured: true,
      name: 'USDC',
      symbol: 'USDC',
    },
  ],
  uniswapV3: {
    factoryAddress: '0xB7f907f7A9eBC822a80BD25E224be42Ce0A698A0',
    positionManager: '0x1238536071E1c677A632429e3655c799b22cDA52',
    universalRouterAddress: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
  },
  unlockAddress: '0x36b34e10295cCE69B652eEB5a8046041074515Da',
  unlockDaoToken: {
    address: '0x447B1492C5038203f1927eB2a374F5Fcdc25999d',
  },
  url: 'https://github.com/eth-clients/sepolia',
}

export default sepolia
