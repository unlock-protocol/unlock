import { signatureError, SIGNATURE_ERROR } from '../../actions/signature'

describe('signature error', () => {
  it('should return the signature error', () => {
    expect.assertions(1)
    const error = new Error('An error')
    const expectation = {
      type: SIGNATURE_ERROR,
      error: error,
    }

    expect(signatureError(new Error('An error'))).toEqual(expectation)
  })
})
