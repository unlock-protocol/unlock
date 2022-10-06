import { networks } from '@unlock-protocol/networks'

const config = {
  // replace with subgraph endpoint v2
  schema: networks['5'].subgraph.endpoint,
  documents: [],
  generates: {
    './src/@generated/subgraph': {
      preset: 'client',
    },
  },
}

export default config
