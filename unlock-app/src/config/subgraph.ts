import { SubgraphService } from '@unlock-protocol/unlock-js'
import pLimit from 'p-limit'

// Use a limit of 2 to balance performance and request flooding prevention
const limit = pLimit(2)

export const graphService = new SubgraphService({
  graphqlClientOptions: {
    fetch: (url, ...args) => {
      return limit(() => fetch(url, ...args))
    },
  },
})
