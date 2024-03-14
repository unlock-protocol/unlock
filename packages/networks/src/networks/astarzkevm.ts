import { NetworkConfig, HookType } from '@unlock-protocol/types'

export const astarzkevm: NetworkConfig = {
  chain: 'Astar zkEVM',
  description:
    'Astar zkEVM is an Ethereum Layer-2 scaling solution leveraging Polygon Chain Development Kit and cutting edge zero-knowledge cryptography to enable off-chain transaction execution, with finality and security guarantees provided by Ethereum.',
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
  hooks: {
    onKeyPurchaseHook: [
      {
        address: '0xe270a288cb5a4633C26B79d8386afa195BcdC610',
        id: HookType.PASSWORD,
        name: 'Password required',
      },
    ],
  },
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
  startBlock: 69147,
  subgraph: {
    endpoint: '',
    networkName: '',
    studioName: '',
  },

  unlockAddress: '0xeBec66d1f006FEC42633B6fa30b0397de8a4D965',
}

export default astarzkevm
