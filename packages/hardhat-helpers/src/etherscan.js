// Etherscan api for verification
// NB: list of supported network can be obtained with `yarn hardhat verify --list-networks`
const etherscan = {
  apiKey: {
    // xdai requires only placeholder api key
    xdai: 'api-key',
  },
  customChains: [
    {
      network: 'celo',
      chainId: 42220,
      urls: {
        apiURL: 'https://api.celoscan.io/api',
        browserURL: 'https://celoscan.io/',
      },
    },
    // below could be removeed once https://github.com/NomicFoundation/hardhat/pull/3207/files is merged
    {
      network: 'gnosis',
      chainId: 100,
      urls: {
        apiURL: 'https://gnosisscan.io/api',
        browserURL: 'https://gnosisscan.io',
      },
    },
  ],
}

if (process.env.ETHERSCAN_API_KEY) {
  ;['mainnet', 'ropsten', 'rinkeby', 'goerli', 'kovan'].forEach(
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
