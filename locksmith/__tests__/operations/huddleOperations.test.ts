import { describe, expect, it } from 'vitest'

import {
  buildHuddleRoomUrl,
  buildTokenGatedRoomPayload,
  getHuddleChainForNetwork,
} from '../../src/operations/huddleOperations'

describe('huddleOperations', () => {
  it('builds a token-gated room payload for an Unlock lock', () => {
    const payload = buildTokenGatedRoomPayload({
      chain: 'ETHEREUM',
      lockAddress: '0x3F09aD349a693bB62a162ff2ff3e097bD1cE9a8C',
      title: 'Community call',
    })

    expect(payload).toEqual({
      roomLocked: false,
      title: 'Community call',
      metadata: {
        title: 'Community call',
        tokenGatingInfo: {
          tokenGatingConditions: [
            {
              chain: 'ETHEREUM',
              contractAddress: '0x3F09aD349a693bB62a162ff2ff3e097bD1cE9a8C',
              tokenType: 'ERC721',
            },
          ],
        },
      },
    })
  })

  it('builds the Huddle iframe URL with a project id', () => {
    expect(buildHuddleRoomUrl('abc-def-ghi', 'project-123')).toBe(
      'https://iframe.huddle01.com/abc-def-ghi?projectId=project-123'
    )
  })

  it('maps Unlock networks to Huddle chain identifiers', () => {
    expect(getHuddleChainForNetwork(1)).toBe('ETHEREUM')
    expect(getHuddleChainForNetwork(137)).toBe('POLYGON')
    expect(getHuddleChainForNetwork(8453)).toBe('BASE')
    expect(getHuddleChainForNetwork(999999)).toBeUndefined()
  })
})
