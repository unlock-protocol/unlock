import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const sepolia: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'sepolia',
  description:
    'Sepolia is the primary testnet recommended by the Ethereum community for dapp development',
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
  faucets: [
    {
      name: 'Google',
      url: 'https://cloud.google.com/application/web3/faucet/ethereum/sepolia',
    },
    {
      name: 'Alchemy',
      url: 'https://www.alchemy.com/faucets/ethereum-sepolia',
    },
    {
      name: 'Infura',
      url: 'https://www.infura.io/faucet/sepolia',
    },
  ],
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
      {
        address: '0x499C854E40Ce4056266822c86D1A326f0FE6491a',
        id: HookType.PASSWORD_CAPPED,
        name: 'Passwords with caps. Multiple passwords can be used per contract',
      },
      {
        address: '0x323Fd488F101F2F9252ecE9f9fe3e56C48912880',
        id: HookType.GITCOIN,
        name: 'Gitcoin',
      },
      {
        address: '0x92954dB2CeB43C2BF241C6a968EF711124408B00',
        id: HookType.ALLOW_LIST,
        name: 'Allow list',
      },
      {
        address: '0x1043D06Fab79Ab2B520d8c67a2B15AbfbfC67B06',
        id: HookType.ALLOW_LIST,
        name: 'Allow List',
      },
    ],
    onTokenURIHook: [
      {
        address: '0x7dB91c34071e7B34656DF9aCBe1542337018D617',
        id: HookType.ADVANCED_TOKEN_URI,
        name: 'Advanced Token URI',
      },
    ],
  },
  id: 11155111,
  isTestNetwork: true,
  keyManagerAddress: '0x338b1f296217485bf4df6CE9f93ab4C73F72b57D',
  kickbackAddress: '0x4D2aAeE1F34a9b4dfA57e8A4041BE82C939278dD',
  maxFreeClaimCost: 1000,
  multisig: '0x95fE514fe7F60722AFF0FD009ebeE4Ba2013924c',
  name: 'Sepolia',

  nativeCurrency: {
    coingecko: 'ethereum',
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
    wrapped: '0x5f207d42F869fd1c71d7f0f81a2A67Fc20FF7323',
  },

  opensea: {
    collectionUrl: (lockAddress) =>
      `https://testnets.opensea.io/assets/sepolia/${lockAddress}`,
    tokenUrl: (_lockAddress, _tokenId) =>
      `https://testnets.opensea.io/assets/sepolia/${_lockAddress}/${_tokenId}`,
  },

  previousDeploys: [],

  provider: 'https://rpc.unlock-protocol.com/11155111',

  publicLockVersionToDeploy: 14,
  publicProvider: 'https://rpc2.sepolia.org/',
  startBlock: 4381710,
  subgraph: {
    endpoint: 'https://subgraph.unlock-protocol.com/11155111',
    graphId: '5ZjqtfMTQJTCsHVmY9eXirW5B9SEJnRW7ipg5SzTP29k',
    networkName: 'sepolia',
    studioName: 'unlock-protocol-sepolia',
  },
  tokens: [
    {
      address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      decimals: 6,
      faucet: { name: 'Circle', url: 'https://faucet.circle.com/' },
      featured: true,
      name: 'USDC',
      symbol: 'USDC',
    },
    {
      address: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
      decimals: 18,
      featured: true,
      mainnetAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      name: 'Wrapped Ether',
      symbol: 'WETH',
    },
    {
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      decimals: 18,
      name: 'Uniswap',
      symbol: 'UNI',
    },
    {
      address: '0x447B1492C5038203f1927eB2a374F5Fcdc25999d',
      decimals: 18,
      name: 'Unlock Discount Token',
      symbol: 'UDT',
    },
  ],
  uniswapV3: {
    factoryAddress: '0x0227628f3F023bb0B980b67D528571c95c6DaC1c',
    oracle: {
      100: '0x5D7109aF116eF9D95f107B25c401bCF3965b4027',
      3000: '0x59E399647F12bDec93875B32376dfBcA2E69d955',
      500: '0x5Ff3C00d851daA690d5fE2a2328A81e4a8219e1a',
    },
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
