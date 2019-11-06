import {
  SIGN_METADATA_REQUEST,
  SIGN_METADATA_RESPONSE,
  signMetadataRequest,
  signMetadataResponse,
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
})
