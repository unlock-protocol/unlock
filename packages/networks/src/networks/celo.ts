import { HookType, NetworkConfig } from '@unlock-protocol/types'

export const celo: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'celo',
  description:
    'Celo is the carbon-negative, mobile-first, EVM-compatible blockchain ecosystem leading a thriving new digital economy for all.',
  explorer: {
    name: 'Celoscan',
    urls: {
      address: (address) => `https://celoscan.io/address/${address}`,
      base: `https://celoscan.io/`,
      token: (address, holder) =>
        `https://celoscan.io/token/${address}?a=${holder}`,
      transaction: (hash) => `https://celoscan.io/tx/${hash}`,
    },
  },
  featured: false,
  hooks: {
    onKeyPurchaseHook: [
      {
        address: '0xdc230F9A08918FaA5ae48B8E13647789A8B6dD46',
        id: HookType.CAPTCHA,
        name: 'Captcha',
      },
      {
        address: '0xe49f5FD63cD7ec130B07dad30f068CC08F201e1e',
        id: HookType.GUILD,
        name: 'Guild',
      },
      {
        address: '0x55C7336ea96BABb0bEabD676C07880aa8b76584a',
        id: HookType.PROMO_CODE_CAPPED,
        name: 'Discount code with caps',
      },
      {
        address: '0xC4E6FDfe46CD1DF46801e080000a4897c42Fd75F',
        id: HookType.PASSWORD_CAPPED,
        name: 'Passwords with caps. Multiple passwords can be used per contract',
      },
      {
        address: '0xa396CFB1fFe3ADD2308dF140aa2d0A520D5c6c31',
        id: HookType.ALLOW_LIST,
        name: 'Allow List',
      },
    ],
    onTokenURIHook: [
      {
        address: '0x15922b77301Df5EA532074e9fb30d115FB6A03fE',
        id: HookType.ADVANCED_TOKEN_URI,
        name: 'Advanced Token URI',
      },
    ],
  },
  id: 42220,
  isTestNetwork: false,
  keyManagerAddress: '0xF6963D3c395A7914De77f771C2fC44b47B8379AC',
  maxFreeClaimCost: 1,
  multisig: '0xc293E2da9E558bD8B1DFfC4a7b174729fAb2e4E8',
  name: 'Celo',
  nativeCurrency: {
    coingecko: 'celo',
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  previousDeploys: [],
  provider: 'https://rpc.unlock-protocol.com/42220',
  publicLockVersionToDeploy: 14,
  publicProvider: 'https://forno.celo.org',
  startBlock: 13994123,
  subgraph: {
    endpoint: 'https://subgraph.unlock-protocol.com/42220',
    graphId: '7WoP8r47dyfYvQv7tk5wxSYyszENqXz2EATjUT8x7gRm',
    studioName: 'unlock-protocol-celo',
  },
  tokens: [
    {
      address: '0xef4229c8c3250C675F21BCefa42f58EfbfF6002a',
      decimals: 6,
      featured: true,
      mainnetAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      name: 'USD Coin',
      symbol: 'USDC',
    },
    {
      address: '0xE4fE50cdD716522A56204352f00AA110F731932d',
      decimals: 18,
      featured: true,
      mainnetAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      name: 'Dai Stablecoin',
      symbol: 'DAI',
    },
  ],
  uniswapV3: {
    factoryAddress: '0xAfE208a311B21f13EF87E33A90049fC17A7acDEc',
    oracle: {
      100: '0xaB82D702A4e0cD165072C005dc504A21c019718F',
      3000: '0x5c67AD0CAfe61aF3706347aBc695D7ACcb38EFb3',
      500: '0xc9F29DdBD4D828cFb2EB491E9d48013a9c0E3C89',
    },
    quoterAddress: '0x82825d0554fA07f7FC52Ab63c961F330fdEFa8E8',
    universalRouterAddress: '0xC73d61d192FB994157168Fb56730FdEc64C9Cb8F',
  },
  unlockAddress: '0x1FF7e338d5E582138C46044dc238543Ce555C963',
  url: 'https://celo.org',
}

export default celo
