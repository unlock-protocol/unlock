import { NetworkConfig } from '@unlock-protocol/types'

export const goerli: NetworkConfig = {
  publicProvider:
    'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  provider: 'https://rpc.unlock-protocol.com/5',
  unlockAddress: '0x627118a4fB747016911e5cDA82e2E77C531e8206',
  multisig: '0x95C06469e557d8645966077891B4aeDe8D55A755',
  keyManagerAddress: '0x862a839fcdba499bbfd6325ba1845787b4b44e61',
  id: 5,
  name: 'Goerli (Testnet)',
  chain: 'goerli',
  blockTime: 1000,
  subgraph: {
    endpoint: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/goerli',
    endpointV2:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/goerli-v2',
  },
  explorer: {
    name: 'Goerli (Testnet)',
    urls: {
      base: `https://goerli.etherscan.io/`,
      address: (address) => `https://goerli.etherscan.io/address/${address}`,
      transaction: (hash) => `https://goerli.etherscan.io/tx/${hash}`,
      token: (address, holder) =>
        `https://goerli.etherscan.io/token/${address}?a=${holder}`,
    },
  },
  opensea: {
    tokenUrl: (lockAddress, tokenId) =>
      `https://testnets.opensea.io/assets/goerli/${lockAddress}/${tokenId}`,
  },
  requiredConfirmations: 12,
  erc20: null,
  baseCurrencySymbol: 'ETH',
  description: 'Main Ethereum test network. Do not use for production',
  locksmithUri: 'https://locksmith.unlock-protocol.com',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
    coingecko: 'ethereum',
  },
  startBlock: 7179039,
  previousDeploys: [],
  isTestNetwork: true,
  maxFreeClaimCost: 100,
  teamMultisig: '0x95C06469e557d8645966077891B4aeDe8D55A755',
  uniswapV3: {
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    oracle: '0x25197CaCDE16500032EF4B35d60c6f7aEd4a38a5',
  },
  wrappedNativeCurrency: {
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    address: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  },
  tokens: [
    {
      name: 'USD Coin',
      symbol: 'USDC',
      address: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
      decimals: 6,
      mainnetAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    },
    {
      name: 'Wrapped Ether',
      address: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
      symbol: 'WETH',
      decimals: 18,
      mainnetAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    },
    {
      name: 'Uniswap',
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      symbol: 'UNI',
      decimals: 18,
      mainnetAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    },
  ],
}

export default goerli
