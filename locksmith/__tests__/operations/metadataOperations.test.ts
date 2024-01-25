import * as metadataOperations from '../../src/operations/metadataOperations'

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
})
