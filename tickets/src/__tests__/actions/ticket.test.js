import {
  SIGN_ADDRESS,
  signAddress,
  GOT_SIGNED_ADDRESS,
  gotSignedAddress,
  VERIFY_SIGNED_ADDRESS,
  verifySignedAddress,
  SIGNED_ADDRESS_VERIFIED,
  signedAddressVerified,
  SIGNED_ADDRESS_MISMATCH,
  signedAddressMismatch,
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

  it('should create an action emitting a request to verify that the address and the signed address match', () => {
    expect.assertions(1)
    const address = '0x12345678'
    const signedAddress = 'ENCRYPTED'
    const expectedAction = {
      type: VERIFY_SIGNED_ADDRESS,
      address,
      signedAddress,
    }

    expect(verifySignedAddress(address, signedAddress)).toEqual(expectedAction)
  })

  it('should create an action emitting a notification that the address and the signed address match', () => {
    expect.assertions(1)
    const address = '0x12345678'
    const signedAddress = 'ENCRYPTED'
    const expectedAction = {
      type: SIGNED_ADDRESS_VERIFIED,
      address,
      signedAddress,
    }

    expect(signedAddressVerified(address, signedAddress)).toEqual(
      expectedAction
    )
  })

  it('should create an action emitting a notification that the address and the signed address do not match', () => {
    expect.assertions(1)
    const address = '0x12345678'
    const signedAddress = 'ENCRYPTED'
    const expectedAction = {
      type: SIGNED_ADDRESS_MISMATCH,
      address,
      signedAddress,
    }

    expect(signedAddressMismatch(address, signedAddress)).toEqual(
      expectedAction
    )
  })
})
