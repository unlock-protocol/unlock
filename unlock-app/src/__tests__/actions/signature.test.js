import { signatureError } from '../../actions/signature'

describe('signature error', () => {
  it('should return the signature error', () => {
    const error = new Error('An error')
    const expectation = {
      type: 'SIGNATURE_ERROR',
      error: error,
    }

    expect(signatureError(new Error('An error'))).toEqual(expectation)
  })
})
