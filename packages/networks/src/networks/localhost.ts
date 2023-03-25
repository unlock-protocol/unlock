import { NetworkConfig } from '@unlock-protocol/types'

export const localhost: NetworkConfig = {
  id: 31337,
  name: 'localhost',
  chain: 'localhost',
  provider: 'http://127.0.0.1:8545',
  publicProvider: 'http://127.0.0.1:8545',
  subgraph: {
    endpoint: 'http://localhost:8000/subgraphs/name/unlock-protocol/unlock',
    endpointV2: 'http://localhost:8000/subgraphs/name/testgraph',
  },
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
    coingecko: 'ethereum',
  },
  serializerAddress: '0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1',
  description: 'Localhost network.',
  isTestNetwork: true,
}
