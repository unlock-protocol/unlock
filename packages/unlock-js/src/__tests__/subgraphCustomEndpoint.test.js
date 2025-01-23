import { describe, it, expect } from 'vitest'
import { SubgraphService } from '../subgraph'

describe('SubgraphService', () => {
  it('creates SDK with provided endpoint URL', async () => {
    const endpointUrl = 'https://test.endpoint.url'
    const subgraphService = new SubgraphService({
      endpointUrl,
    })

    expect(subgraphService.endpointUrl).toBe(endpointUrl)
  })
})
