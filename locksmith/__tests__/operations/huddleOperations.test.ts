import { describe, expect, it, beforeEach } from 'vitest'
import config from '../../src/config/config'
import {
  buildHuddleRoomUrl,
  buildTokenGatedRoomPayload,
  createTokenGatedHuddleRoom,
  getHuddleChainForNetwork,
} from '../../src/operations/huddleOperations'

describe('huddleOperations', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
    config.huddle.apiKey = 'huddle-api-key'
    config.huddle.projectId = 'project-id'
    config.huddle.iframeBaseUrl = 'https://iframe.huddle01.com'
  })

  it('maps Unlock network ids to Huddle chain names', () => {
    expect(getHuddleChainForNetwork(1)).toBe('ETHEREUM')
    expect(getHuddleChainForNetwork(137)).toBe('POLYGON')
    expect(getHuddleChainForNetwork(8453)).toBe('BASE')
    expect(getHuddleChainForNetwork(999999)).toBeUndefined()
  })

  it('builds a Huddle iframe room URL with the configured project id', () => {
    expect(
      buildHuddleRoomUrl({
        iframeBaseUrl: 'https://iframe.huddle01.com/',
        projectId: 'project-id',
        roomId: 'abc-def-ghi',
      })
    ).toBe('https://iframe.huddle01.com/abc-def-ghi?projectId=project-id')
  })

  it('builds token-gating metadata for the event lock', () => {
    expect(
      buildTokenGatedRoomPayload({
        chain: 'BASE',
        hostWallets: ['0x0000000000000000000000000000000000000001'],
        lockAddress: '0x3F09aD349a693bB62a162ff2ff3e097bD1cE9a8C',
        network: 8453,
        title: 'Token gated event',
      })
    ).toMatchObject({
      roomLocked: false,
      metadata: {
        title: 'Token gated event',
        hostWallets: ['0x0000000000000000000000000000000000000001'],
        tokenGatingInfo: {
          type: 'unlock-event-lock',
          tokenGatingConditions: [
            {
              chain: 'BASE',
              chainId: 8453,
              contractAddress: '0x3F09aD349a693bB62a162ff2ff3e097bD1cE9a8C',
              tokenType: 'ERC721',
            },
          ],
        },
      },
    })
  })

  it('creates a token-gated Huddle room and returns the iframe URL', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        data: {
          roomId: 'abc-def-ghi',
        },
      })
    )

    await expect(
      createTokenGatedHuddleRoom({
        hostWallets: ['0x0000000000000000000000000000000000000001'],
        lockAddress: '0x3F09aD349a693bB62a162ff2ff3e097bD1cE9a8C',
        network: 8453,
        title: 'Token gated event',
      })
    ).resolves.toEqual({
      roomId: 'abc-def-ghi',
      roomUrl: 'https://iframe.huddle01.com/abc-def-ghi?projectId=project-id',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.huddle01.com/api/v2/sdk/rooms/create-room',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'huddle-api-key',
        },
      })
    )
  })

  it('fails clearly when Huddle is not configured', async () => {
    config.huddle.apiKey = undefined

    await expect(
      createTokenGatedHuddleRoom({
        lockAddress: '0x3F09aD349a693bB62a162ff2ff3e097bD1cE9a8C',
        network: 8453,
        title: 'Token gated event',
      })
    ).rejects.toThrow('Huddle01 is not configured')
  })
})
