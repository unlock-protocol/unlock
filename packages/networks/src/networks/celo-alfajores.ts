import { NetworkConfig } from '@unlock-protocol/types'

export const celoAlfajores: NetworkConfig = {
  blockScan: {
    url: (address: string) => `https://blockscan.com/address/${address}`,
  },
  chain: 'celo-alfajores',
  description: 'The Developer Testnet network',
  explorer: {
    name: 'Celoscan Alfajores',
    urls: {
      address: (address) => `https://alfajores.celoscan.io/address/${address}`,
      base: `https://alfajores.celoscan.io/`,
      token: (address, holder) =>
        `https://alfajores.celoscan.io/token/${address}?a=${holder}`,
      transaction: (hash) => `https://alfajores.celoscan.io/tx/${hash}`,
    },
  },
  featured: false,
  hooks: {},
  id: 44787,
  isTestNetwork: true,
  keyManagerAddress: '0xb8fe3795f6b49F35F7779f559e7a0431679ce402',
  maxFreeClaimCost: 1,
  multisig: '0xCbef56d42a18908E8b2900C3A81DA0fBfA4234BD',
  name: 'Celo',
  nativeCurrency: {
    coingecko: 'celo',
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  previousDeploys: [],
  provider: 'https://alfajores-forno.celo-testnet.org',
  publicLockVersionToDeploy: 14,
  publicProvider: 'https://alfajores-forno.celo-testnet.org',
  startBlock: 24337460,
  subgraph: {
    endpoint:
      'https://api.studio.thegraph.com/query/47158/unlock-protocol-celo-alfajores/version/latest',
    networkName: 'celo-alfajores',
    studioName: 'unlock-protocol-celo-alfajores',
  },
  swapPurchaser: '',
  tokens: [],
  unlockAddress: '0x42E2E35876FD1912972bc926E7b8e34bb501a10C',
  url: 'https://celo.org',
}

export default celoAlfajores
