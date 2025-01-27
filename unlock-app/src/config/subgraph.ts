import { SubgraphService } from '@unlock-protocol/unlock-js'
import pLimit from 'p-limit'

const limit = pLimit(3)

export const graphService = new SubgraphService({
  graphqlClientOptions: {
    fetch: (url, ...args) => {
      return limit(() => fetch(url, ...args))
    },
  },
})
