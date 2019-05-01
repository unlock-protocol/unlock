export const SIGN_ADDRESS = 'ticket/SIGN_ADDRESS'
export const GOT_SIGNED_ADDRESS = 'ticket/GOT_SIGNED_ADDRESS'

export const signAddress = address => ({
  type: SIGN_ADDRESS,
  address,
})

export const gotSignedAddress = (address, signedAddress) => ({
  type: GOT_SIGNED_ADDRESS,
  address,
  signedAddress,
})
