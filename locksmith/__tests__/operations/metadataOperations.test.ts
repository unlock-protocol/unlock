const metadataOperations = require('../../src/operations/metadataOperations')
require('../../src/models')

describe('metadataOperations', () => {
  describe('updateKeyMetadata', () => {
    describe('when update is successful', () => {
      it('returns true', async () => {
        expect.assertions(1)
        let updateStatus = await metadataOperations.updateKeyMetadata({
          address: '0x2335',
          id: '2',
        })
        expect(updateStatus).toBe(true)
      })
    })
    describe('when update fails', () => {
      it('returns false', async () => {
        expect.assertions(1)
        let updateStatus = await metadataOperations.updateKeyMetadata({})
        expect(updateStatus).toBe(false)
      })
    })
  })
  describe('updateDefaultLockMetadata', () => {
    describe('when update is successful', () => {
      it('returns true', async () => {
        expect.assertions(1)
        let updateStatus = await metadataOperations.updateDefaultLockMetadata({
          address: '0x2335',
          id: 2,
          data: {
            foo: 'bar',
          },
        })
        expect(updateStatus).toBe(true)
      })
    })
    describe('when update fails', () => {
      it('returns false', async () => {
        expect.assertions(1)
        let updateStatus = await metadataOperations.updateDefaultLockMetadata({
          id: 2,
          data: {
            foo: 'bar',
          },
        })
        expect(updateStatus).toBe(false)
      })
    })
  })
})
