import * as metadataOperations from '../../src/operations/metadataOperations'
import { vi } from 'vitest'

vi.mock('../../src/utils/metadata', () => ({
  getDefaultLockData: async ({ lockAddress }: { lockAddress: string }) => ({
    name: 'Unlock Lock',
    image: `https://locksmith.unlock-protocol.com/lock/${lockAddress}/icon`,
  }),
}))

const chain = 31337

describe('metadataOperations', () => {
  describe('updateKeyMetadata', () => {
    describe('when update is successful', () => {
      it('returns true', async () => {
        expect.assertions(1)
        const updateStatus = await metadataOperations.updateKeyMetadata({
          chain,
          address: '0x2335',
          id: '2',
        })
        expect(updateStatus).toBe(true)
      })
    })
    describe('when update fails', () => {
      it('returns false', async () => {
        expect.assertions(1)
        const updateStatus = await metadataOperations.updateKeyMetadata({})
        expect(updateStatus).toBe(false)
      })
    })
  })
  describe('updateDefaultLockMetadata', () => {
    describe('when update is successful', () => {
      it('returns true', async () => {
        expect.assertions(1)
        const updateStatus = await metadataOperations.updateDefaultLockMetadata(
          {
            chain,
            address: '0x2335',
            id: 2,
            data: {
              foo: 'bar',
            },
          }
        )
        expect(updateStatus).toBe(true)
      })
    })
    describe('when update fails', () => {
      it('returns false', async () => {
        expect.assertions(1)
        const updateStatus = await metadataOperations.updateDefaultLockMetadata(
          {
            chain,
            id: 2,
            data: {
              foo: 'bar',
            },
          }
        )
        expect(updateStatus).toBe(false)
      })
    })
  })
  describe('getKeyCentricData', () => {
    it('should not fail if no tokenId is passed as it is not defined for pending RSVP keys', async () => {
      expect.assertions(1)
      const address = '0x123'
      const data = await metadataOperations.getKeyCentricData(address)
      expect(data).toEqual({})
    })
  })
  describe('getBaseTokenData', () => {
    const host = 'https://locksmith.unlock-protocol.com'
    const network = 8453

    it('points keys of locks using the generated icon to their own icon', async () => {
      expect.assertions(1)
      const address = '0x685B12846ed3D3586A0f811C39059CB47fBA2558'
      const data = await metadataOperations.getBaseTokenData(
        address,
        host,
        '999',
        network
      )
      expect(data.image).toBe(`${host}/${network}/lock/${address}/icon?id=999`)
    })

    it('keeps a custom lock image', async () => {
      expect.assertions(1)
      const address = '0x95de5F777A3e283bFf0c47374998E10D8A2183C7'
      await metadataOperations.updateDefaultLockMetadata({
        chain: network,
        address,
        data: { image: 'https://example.com/custom.png' },
      })
      const data = await metadataOperations.getBaseTokenData(
        address,
        host,
        '1',
        network
      )
      expect(data.image).toBe('https://example.com/custom.png')
    })
  })
})
