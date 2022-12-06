import { networks } from '@unlock-protocol/networks'

const config = {
  // use local node for generating
  schema: networks['31337'].subgraph.endpointV2,
  documents: ['./src/subgraph/schema.graphql'],
  generates: {
    './src/@generated/subgraph/index.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-graphql-request',
      ],
    },
  },
}

export default config
