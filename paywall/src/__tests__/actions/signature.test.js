import {
  signatureError,
  SIGNATURE_ERROR,
  SIGN_DATA,
  signData,
  signedData,
  SIGNED_DATA,
} from '../../actions/signature'

describe('signature actions', () => {
  it('should have an action for signature errors', () => {
    expect.assertions(1)
    const error = new Error('An error')
    const expectation = {
      type: SIGNATURE_ERROR,
      error: error,
    }

    expect(signatureError(new Error('An error'))).toEqual(expectation)
  })

  it('should have an action to sign data', () => {
    expect.assertions(1)
    const data = 'hello'
    const expectation = {
      type: SIGN_DATA,
      data,
    }

    expect(signData(data)).toEqual(expectation)
  })

  it('should have an action to show signed data', () => {
    expect.assertions(1)
    const data = 'hello'
    const signature = 'signature'
    const expectation = {
      type: SIGNED_DATA,
      data,
      signature,
    }

    expect(signedData(data, signature)).toEqual(expectation)
  })
})
