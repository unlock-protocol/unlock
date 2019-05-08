export const SIGN_ADDRESS = 'ticket/SIGN_ADDRESS'
export const GOT_SIGNED_ADDRESS = 'ticket/GOT_SIGNED_ADDRESS'
export const VERIFY_SIGNED_ADDRESS = 'ticket/VERIFY_SIGNED_ADDRESS'
export const SIGNED_ADDRESS_VERIFIED = 'ticket/SIGNED_ADDRESS_VERIFIED'
export const SIGNED_ADDRESS_MISMATCH = 'ticket/SIGNED_ADDRESS_MISMATCH'

export const signAddress = address => ({
  type: SIGN_ADDRESS,
  address,
})

export const gotSignedAddress = (address, signedAddress) => ({
  type: GOT_SIGNED_ADDRESS,
  address,
  signedAddress,
})

export const verifySignedAddress = (address, signedAddress) => ({
  type: VERIFY_SIGNED_ADDRESS,
  address,
  signedAddress,
})

export const signedAddressVerified = (address, signedAddress) => ({
  type: SIGNED_ADDRESS_VERIFIED,
  address,
  signedAddress,
})

export const signedAddressMismatch = (address, signedAddress) => ({
  type: SIGNED_ADDRESS_MISMATCH,
  address,
  signedAddress,
})
