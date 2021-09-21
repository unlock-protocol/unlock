import { NetworkConfig } from '../types';

export const localhost : NetworkConfig = {
    id: 31117,
    name: 'localhost',
    provider: 'http://127.0.0.1:8545',
    locksmithUri: 'http://127.0.0.1:8080',
    unlockAppUrl: 'http://0.0.0.0:3000',
    subgraphURI: 'http://localhost:8000/subgraphs/name/unlock-protocol/unlock',
}
