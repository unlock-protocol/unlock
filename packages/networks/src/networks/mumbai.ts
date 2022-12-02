import { NetworkConfig } from '@unlock-protocol/types'

export const mumbai: NetworkConfig = {
  publicProvider: 'https://matic-mumbai.chainstacklabs.com',
  provider: 'https://rpc.unlock-protocol.com/80001',
  unlockAddress: '0x1FF7e338d5E582138C46044dc238543Ce555C963',
  multisig: '0x12E37A8880801E1e5290c815a894d322ac591607',
  id: 80001,
  name: 'Mumbai (Polygon)',
  blockTime: 1000,
  chain: 'mumbai',
  subgraph: {
    endpoint: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/mumbai',
    endpointV2:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/mumbai-v2',
  },
  explorer: {
    name: 'PolygonScan (Mumbai)',
    urls: {
      base: `https://mumbai.polygonscan.com/`,
      address: (address) => `https://mumbai.polygonscan.com/address/${address}`,
      transaction: (hash) => `https://mumbai.polygonscan.com/tx/${hash}`,
      token: (address, holder) =>
        `https://mumbai.polygonscan.com/token/${address}?a=${holder}`,
    },
  },
  opensea: {
    tokenUrl: (_lockAddress, _tokenId) => null,
  },
  requiredConfirmations: 12,
  erc20: null,
  baseCurrencySymbol: 'MATIC',
  locksmithUri: 'https://locksmith.unlock-protocol.com',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
    coingecko: 'matic-network',
  },
  startBlock: 26584912,
  previousDeploys: [],
  description: 'Polygon test network. Do not use for production',
  isTestNetwork: true,
  teamMultisig: '0x12E37A8880801E1e5290c815a894d322ac591607',
  uniswapV3: {
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    quoterAddress: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    oracle: '0x5108412Dd50A6ea79d2F13D5d1A23FDD9bF532db',
  },
  wrappedNativeCurrency: {
    name: 'Wrapped MATIC',
    symbol: 'WMATIC',
    decimals: 18,
    address: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
  },
  tokens: [
    {
      name: 'USD Coin',
      address: '0x0FA8781a83E46826621b3BC094Ea2A0212e71B23',
      symbol: 'USDC',
      decimals: 6,
      mainnetAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    },
    {
      name: 'Wrapped Ether',
      address: '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa',
      symbol: 'WETH',
      decimals: 18,
      mainnetAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    },
    {
      name: 'Wrapped Matic',
      address: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
      symbol: 'WMATIC',
      decimals: 18,
      mainnetAddress: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
    },
    {
      name: 'Dai Stablecoin',
      address: '0xcB1e72786A6eb3b44C2a2429e317c8a2462CFeb1',
      symbol: 'DAI',
      decimals: 18,
      mainnetAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    },
  ],
}

export default mumbai
