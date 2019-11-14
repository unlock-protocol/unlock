import {
  SIGN_BULK_METADATA_REQUEST,
  SIGN_BULK_METADATA_RESPONSE,
  GOT_BULK_METADATA,
  signBulkMetadataRequest,
  signBulkMetadataResponse,
  gotBulkMetadata,
} from '../../actions/keyMetadata'

const lockAddress = '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267'

describe('Key metadata signature actions', () => {
  describe('signMetadataRequest', () => {
    it('should create an action to request a signature', () => {
      expect.assertions(1)

      const owner = '0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a'
      const result = signBulkMetadataRequest(lockAddress, owner)

      expect(result).toEqual({
        type: SIGN_BULK_METADATA_REQUEST,
        lockAddress,
        owner,
        timestamp: expect.any(Number),
      })
    })
  })

  describe('signMetadataResponse', () => {
    it('should create an action to return a signature', () => {
      expect.assertions(1)

      const result = signBulkMetadataResponse(
        'some data',
        'a signature',
        lockAddress
      )

      expect(result).toEqual({
        type: SIGN_BULK_METADATA_RESPONSE,
        data: 'some data',
        signature: 'a signature',
        lockAddress,
      })
    })
  })

  describe('gotMetadata', () => {
    it('should create an action to put the metadata in redux', () => {
      expect.assertions(1)

      const result = gotBulkMetadata('a lock address', 'some data')

      expect(result).toEqual({
        type: GOT_BULK_METADATA,
        lockAddress: 'a lock address',
        data: 'some data',
      })
    })
  })
})
