// Etherscan api for verification
// NB: list of supported network can be obtained with `yarn hardhat verify --list-networks`

const etherscan = {
  apiKey: {
    // xdai requires only placeholder api key
    polygon: 'W9TVEYKW2CDTQ94T3A2V93IX6U3IHQN5Y3',
    mainnet: 'HPSH1KQDPJTNAPU3335G931SC6Y3ZYK3BF',
    sepolia: 'HPSH1KQDPJTNAPU3335G931SC6Y3ZYK3BF',
    bsc: '6YUDRP3TFPQNRGGZQNYAEI1UI17NK96XGK',
    gnosis: 'BSW3C3NDUUBWSQZJ5FUXBNXVYX92HZDDCV',
    xdai: 'BSW3C3NDUUBWSQZJ5FUXBNXVYX92HZDDCV',
    optimisticEthereum: 'V51DWC44XURIGPP49X85VZQGH1DCBAW5EC',
    arbitrumOne: 'W5XNFPZS8D6JZ5AXVWD4XCG8B5ZH5JCD4Y',
    avalanche: 'N4AF8AYN8PXY2MFPUT8PAFSZNVJX5Q814X',
    celo: '6KBKUFYV3NQR4Y1BQN3Q34S2U7NTZBBPQZ',
    base: 'F9E5R4E8HIJQZMRE9U9IZMP7NVZ2IAXNB8',
    baseSepolia: 'F9E5R4E8HIJQZMRE9U9IZMP7NVZ2IAXNB8',
    linea: 'S66J314Q7PICPB4RP2G117KDFQRBEUYIFX',
    polygonZkEVM: '8H4ZB9SQBMQ7WA1TCIXFQVCHTVX8DXTY9Y',
    scroll: 'BZEXNPN6KKKJQ8VIMNXZDZNEX7QQZWZQ3P',
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
      network: 'baseSepolia',
      chainId: 84532,
      urls: {
        apiURL: 'https://api-sepolia.basescan.org/api',
        browserURL: 'https://sepolia.basescan.org/',
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
    {
      network: 'linea',
      chainId: 59144,
      urls: {
        apiURL: 'https://api.lineascan.build/api',
        browserURL: 'https://lineascan.build/',
      },
    },
    {
      network: 'scroll',
      chainId: 534352,
      urls: {
        apiURL: 'https://api.scrollscan.com/api',
        browserURL: 'https://scrollscan.com/',
      },
    },
  ],
}

if (process.env.ETHERSCAN_API_KEY) {
  ;['mainnet', 'sepolia'].forEach(
    (netName) => (etherscan.apiKey[netName] = process.env.ETHERSCAN_API_KEY)
  )
}
if (process.env.POLYGONSCAN_API_KEY) {
  etherscan.apiKey.polygon = process.env.POLYGONSCAN_API_KEY
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
if (process.env.SEPOLIA_API_KEY) {
  etherscan.apiKey.sepolia = process.env.SEPOLIA_API_KEY
}

export default etherscan
