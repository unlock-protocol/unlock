import {
  SIGN_METADATA_REQUEST,
  SIGN_METADATA_RESPONSE,
  GOT_METADATA,
  signMetadataRequest,
  signMetadataResponse,
  gotMetadata,
} from '../../actions/keyMetadata'

describe('Key metadata signature actions', () => {
  describe('signMetadataRequest', () => {
    it('should create an action to request a signature', () => {
      expect.assertions(1)

      const address = '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267'
      const owner = '0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a'
      const result = signMetadataRequest(address, owner)

      expect(result).toEqual({
        type: SIGN_METADATA_REQUEST,
        address,
        owner,
        timestamp: expect.any(Number),
      })
    })
  })

  describe('signMetadataResponse', () => {
    it('should create an action to return a signature', () => {
      expect.assertions(1)

      const result = signMetadataResponse('some data', 'a signature')

      expect(result).toEqual({
        type: SIGN_METADATA_RESPONSE,
        data: 'some data',
        signature: 'a signature',
      })
    })
  })

  describe('gotMetadata', () => {
    it('should create an action to put the metadata in redux', () => {
      expect.assertions(1)

      const result = gotMetadata('a lock address', '1', 'some data')

      expect(result).toEqual({
        type: GOT_METADATA,
        lockAddress: 'a lock address',
        keyId: '1',
        data: 'some data',
      })
    })
  })
})
