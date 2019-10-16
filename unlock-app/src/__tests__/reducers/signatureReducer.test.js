import reducer, { initialState } from '../../reducers/signatureReducer'
import { SET_ACCOUNT } from '../../actions/accounts'
import { SET_PROVIDER } from '../../actions/provider'
import { SET_NETWORK } from '../../actions/network'
import { SIGNED_DATA } from '../../actions/signature'

const stateWithSignature = {
  theFirstSignature: {
    data: 'this is my data',
    signature: 'this is the signature for my data',
  },
}

describe('signature reducer', () => {
  it('should return the initial state', () => {
    expect.assertions(1)
    expect(reducer(undefined, {})).toEqual(initialState)
  })

  it('should return the initial state when receveing SET_PROVIDER', () => {
    expect.assertions(1)
    expect(
      reducer(stateWithSignature, {
        type: SET_PROVIDER,
      })
    ).toEqual(initialState)
  })

  it('should return the initial state when receveing SET_NETWORK', () => {
    expect.assertions(1)
    expect(
      reducer(stateWithSignature, {
        type: SET_NETWORK,
      })
    ).toEqual(initialState)
  })

  it('should return the initial state when receiving SET_ACCOUNT', () => {
    expect.assertions(1)
    expect(
      reducer(stateWithSignature, {
        type: SET_ACCOUNT,
      })
    ).toEqual(initialState)
  })

  it('should append the signature when receiving SIGNED_DATA', () => {
    expect.assertions(1)

    expect(
      reducer(stateWithSignature, {
        type: SIGNED_DATA,
        signature: 'a different signature',
        data: 'some different data',
        id: 'signature1',
      })
    ).toEqual({
      ...stateWithSignature,
      signature1: {
        signature: 'a different signature',
        data: 'some different data',
      },
    })
  })

  it('should overwrite an old signature when receiving a new one', () => {
    expect.assertions(1)

    expect(
      reducer(stateWithSignature, {
        type: SIGNED_DATA,
        signature: 'a different signature',
        data: 'some different data',
        id: 'theFirstSignature',
      })
    ).toEqual({
      theFirstSignature: {
        signature: 'a different signature',
        data: 'some different data',
      },
    })
  })
})
