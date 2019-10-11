import reducer from '../../reducers/signatureReducer'
import { SET_ACCOUNT } from '../../actions/accounts'
import { SET_PROVIDER } from '../../actions/provider'
import { SET_NETWORK } from '../../actions/network'
import { SIGNED_DATA } from '../../actions/signature'

const storedSignature = {
  data: 'this is my data',
  signature: 'this is the signature for my data',
}

describe('signature reducer', () => {
  it('should return the initial state', () => {
    expect.assertions(1)
    expect(reducer(undefined, {})).toEqual(null)
  })

  it('should return the initial state when receveing SET_PROVIDER', () => {
    expect.assertions(1)
    expect(
      reducer(storedSignature, {
        type: SET_PROVIDER,
      })
    ).toEqual(null)
  })

  it('should return the initial state when receveing SET_NETWORK', () => {
    expect.assertions(1)
    expect(
      reducer(storedSignature, {
        type: SET_NETWORK,
      })
    ).toEqual(null)
  })

  it('should return the initial state when receiving SET_ACCOUNT', () => {
    expect.assertions(1)
    expect(
      reducer(storedSignature, {
        type: SET_ACCOUNT,
      })
    ).toEqual(null)
  })

  it('should store the signature when receiving SIGNED_DATA', () => {
    expect.assertions(1)

    expect(
      reducer(storedSignature, {
        type: SIGNED_DATA,
        signature: 'a different signature',
        data: 'some different data',
      })
    ).toEqual({
      signature: 'a different signature',
      data: 'some different data',
    })
  })
})
