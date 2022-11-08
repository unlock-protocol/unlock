import { NetworkConfig } from '@unlock-protocol/types'

export const goerli: NetworkConfig = {
  publicProvider:
    'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  provider: 'https://rpc.unlock-protocol.com/5',
  unlockAddress: '0x627118a4fB747016911e5cDA82e2E77C531e8206',
  multisig: '0x95C06469e557d8645966077891B4aeDe8D55A755',
  id: 5,
  name: 'Goerli (Testnet)',
  blockTime: 1000,
  subgraph: {
    endpoint: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/goerli',
    endpointV2:
      'https://api.thegraph.com/subgraphs/name/unlock-protocol/goerli-v2',
  },
  explorer: {
    name: 'Goerli (Testnet)',
    urls: {
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
  },
  startBlock: 7179039,
  previousDeploys: [],
  isTestNetwork: true,
  teamMultisig: '0x95C06469e557d8645966077891B4aeDe8D55A755',
  uniswapV3: {
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  },
  tokens: [
    {
      name: 'USD Coin',
      symbol: 'USDC',
      address: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
      decimals: 6,
    },
    {
      name: 'Wrapped Ether',
      address: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
      symbol: 'WETH',
      decimals: 18,
    },

    {
      name: 'Uniswap',
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      symbol: 'UNI',
      decimals: 18,
    },
  ],
}

export default goerli
