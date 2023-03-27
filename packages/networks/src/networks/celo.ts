import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const celo: NetworkConfig = {
  publicProvider: 'https://forno.celo.org',
  provider: 'https://rpc.unlock-protocol.com/42220',
  unlockAddress: '0x1FF7e338d5E582138C46044dc238543Ce555C963',
  multisig: '0xc293E2da9E558bD8B1DFfC4a7b174729fAb2e4E8',
  keyManagerAddress: '0xF6963D3c395A7914De77f771C2fC44b47B8379AC',
  id: 42220,
  name: 'Celo',
  chain: 'celo',
  description:
    'Celo is the carbon-negative, mobile-first, EVM-compatible blockchain ecosystem leading a thriving new digital economy for all.',
  url: 'https://celo.org',
  subgraph: {
    endpoint: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/celo',
    endpointV2:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/celo-v2',
  },
  explorer: {
    name: 'Celoscan',
    urls: {
      base: `https://celoscan.io/`,
      address: (address) => `https://celoscan.io/address/${address}`,
      transaction: (hash) => `https://celoscan.io/tx/${hash}`,
      token: (address, holder) =>
        `https://celoscan.io/token/${address}?a=${holder}`,
    },
  },
  opensea: {
    tokenUrl: (_lockAddress, _tokenId) => null,
  },
  nativeCurrency: {
    name: 'CELO',
    symbol: 'CELO',
    decimals: 18,
    coingecko: 'celo',
  },
  startBlock: 7179039,
  previousDeploys: [],
  isTestNetwork: false,
  maxFreeClaimCost: 1,
  uniswapV3: {
    factoryAddress: '0xAfE208a311B21f13EF87E33A90049fC17A7acDEc',
    quoterAddress: '0x82825d0554fA07f7FC52Ab63c961F330fdEFa8E8',
    oracle: '0x5108412Dd50A6ea79d2F13D5d1A23FDD9bF532db',
  },
  swapPurchaser: '0x42F5c7839Bf00FAea6ca09517E96E82e7364384D',
  wrappedNativeCurrency: {
    name: 'Celo native asset',
    symbol: 'CELO',
    decimals: 18,
    address: '0x471ece3750da237f93b8e339c536989b8978a438',
  },
  tokens: [
    {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      address: '0xef4229c8c3250c675f21bcefa42f58efbff6002a',
      mainnetAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    },
    {
      name: 'Dai Stablecoin',
      address: '0xE4fE50cdD716522A56204352f00AA110F731932d',
      symbol: 'DAI',
      decimals: 18,
      mainnetAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    },
  ],
  hooks: {
    onKeyPurchaseHook: [
      {
        id: HookType.CAPTCHA,
        name: 'Captcha',
        address: '0x80E085D7591C61153D876b5171dc25756a7A3254',
      },
    ],
  },
}

export default celo
