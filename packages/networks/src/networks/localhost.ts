import { NetworkConfig } from '@unlock-protocol/types'

export const localhost: NetworkConfig = {
  id: 31337,
  name: 'localhost',
  provider: 'http://127.0.0.1:8545',
  publicProvider: 'http://127.0.0.1:8545',
  locksmithUri: 'http://127.0.0.1:8080',
  unlockAppUrl: 'http://0.0.0.0:3000',
  subgraphURI: 'http://localhost:8000/subgraphs/name/unlock-protocol/unlock',
  serializerAddress: '0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1',
  description: 'Localhost network.',
}
