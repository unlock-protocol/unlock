// Etherscan api for verification
// NB: list of supported network can be obtained with `yarn hardhat verify --list-networks`
const etherscan = {
  apiKey: {
    // xdai requires only placeholder api key
    xdai: 'api-key',
    polygon: 'W9TVEYKW2CDTQ94T3A2V93IX6U3IHQN5Y3',
    goerli: 'HPSH1KQDPJTNAPU3335G931SC6Y3ZYK3BF',
    mainnet: 'HPSH1KQDPJTNAPU3335G931SC6Y3ZYK3BF',
    bsc: '6YUDRP3TFPQNRGGZQNYAEI1UI17NK96XGK',
    gnosis: 'BSW3C3NDUUBWSQZJ5FUXBNXVYX92HZDDCV',
    optimisticEthereum: 'V51DWC44XURIGPP49X85VZQGH1DCBAW5EC',
    arbitrumOne: 'W5XNFPZS8D6JZ5AXVWD4XCG8B5ZH5JCD4Y',
    polygonMumbai: 'W9TVEYKW2CDTQ94T3A2V93IX6U3IHQN5Y3',
    avalanche: 'N4AF8AYN8PXY2MFPUT8PAFSZNVJX5Q814X',
    celo: '6KBKUFYV3NQR4Y1BQN3Q34S2U7NTZBBPQZ',
    palm: 'abc',
    baseGoerli: 'YourApiKeyToken',
    base: 'F9E5R4E8HIJQZMRE9U9IZMP7NVZ2IAXNB8',
  },
  // TODO : generate from networks package!
  customChains: [
    {
      network: 'celo',
      chainId: 42220,
      urls: {
        apiURL: 'https://api.celoscan.io/api',
        browserURL: 'https://celoscan.io/',
      },
    },
    {
      network: 'palm',
      chainId: 11297108109,
      urls: {
        apiURL: 'https://explorer.palm.io/address/api',
        browserURL: 'https://explorer.palm.io/',
      },
    },
    {
      network: 'baseGoerli',
      chainId: 84531,
      urls: {
        apiURL: 'https://api-goerli.basescan.org/api',
        browserURL: 'https://goerli.basescan.org/',
      },
    },
    {
      network: 'base',
      chainId: 8453,
      urls: {
        apiURL: 'https://api.basescan.org/api',
        browserURL: 'https://basescan.org/',
      },
    },
  ],
}

if (process.env.ETHERSCAN_API_KEY) {
  ;['mainnet', 'goerli'].forEach(
    // eslint-disable-next-line no-return-assign
    (netName) => (etherscan.apiKey[netName] = process.env.ETHERSCAN_API_KEY)
  )
}
if (process.env.POLYGONSCAN_API_KEY) {
  etherscan.apiKey.polygon = process.env.POLYGONSCAN_API_KEY
  etherscan.apiKey.polygonMumbai = process.env.POLYGONSCAN_API_KEY
}
if (process.env.BSCSCAN_API_KEY) {
  etherscan.apiKey.bsc = process.env.BSCSCAN_API_KEY
}
if (process.env.OPTIMISTIC_ETHERSCAN_API_KEY) {
  etherscan.apiKey.optimisticEthereum = process.env.OPTIMISTIC_ETHERSCAN_API_KEY
}
if (process.env.ARBISCAN_API_KEY) {
  etherscan.apiKey.arbitrumOne = process.env.ARBISCAN_API_KEY
}
if (process.env.CELO_API_KEY) {
  etherscan.apiKey.celo = process.env.CELO_API_KEY
}
if (process.env.SNOWTRACE_API_KEY) {
  etherscan.apiKey.avalanche = process.env.SNOWTRACE_API_KEY
}
if (process.env.GNOSISSCAN_API_KEY) {
  etherscan.apiKey.gnosis = process.env.GNOSISSCAN_API_KEY
}

module.exports = { etherscan }
