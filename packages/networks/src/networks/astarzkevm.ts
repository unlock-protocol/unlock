import { NetworkConfig } from '@unlock-protocol/types'

export const astarzkevm: NetworkConfig = {
  chain: 'Astar zkEVM',
  description: '',
  explorer: {
    name: 'Astar zkEVM (Startale)',
    urls: {
      address: (address) =>
        `https://astar-zkevm.explorer.startale.com/address/${address}`,
      base: `https://astar-zkevm.explorer.startale.com/`,
      token: (address, holder) =>
        `https://astar-zkevm.explorer.startale.com/token/${address}?a=${holder}`,
      transaction: (hash) =>
        `https://astar-zkevm.explorer.startale.com/tx/${hash}`,
    },
  },
  featured: false,
  id: 3776,
  isTestNetwork: false,
  name: 'Astar zkEVM',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  previousDeploys: [],
  provider: 'https://rpc.startale.com/astar-zkevm',
  publicLockVersionToDeploy: 14,
  publicProvider: 'https://rpc.startale.com/astar-zkevm',
  startBlock: 0,
  subgraph: {
    endpoint: '',
    networkName: '',
    studioName: '',
  },

  unlockAddress: '',
  //   url: 'https://polygon.technology/polygon-zkevm',
}

export default astarzkevm
