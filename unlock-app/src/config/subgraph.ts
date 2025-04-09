import { SubgraphService } from '@unlock-protocol/unlock-js'
import pLimit from 'p-limit'

// using a limit of 5 to balance performance and request flooding prevention
const limit = pLimit(5)

export const graphService = new SubgraphService({
  graphqlClientOptions: {
    fetch: (url, ...args) => {
      return limit(() => fetch(url, ...args))
    },
  },
})
