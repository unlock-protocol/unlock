import { networks } from '@unlock-protocol/networks'

const config = {
  schema: networks['5'].subgraph.endpointV2,
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
