import {
  SIGN_ADDRESS,
  signAddress,
  GOT_SIGNED_ADDRESS,
  gotSignedAddress,
} from '../../actions/ticket'

describe('ticket actions', () => {
  it('should create an action emitting a request to sign a ticket', () => {
    expect.assertions(1)
    const address = '0x12345678'
    const expectedAction = {
      type: SIGN_ADDRESS,
      address,
    }

    expect(signAddress(address)).toEqual(expectedAction)
  })

  it('should create an action emitting an address that has been signed', () => {
    expect.assertions(1)
    const address = '0x12345678'
    const signedAddress = 'ENCRYPTED'
    const expectedAction = {
      type: GOT_SIGNED_ADDRESS,
      address,
      signedAddress,
    }

    expect(gotSignedAddress(address, signedAddress)).toEqual(expectedAction)
  })
})
