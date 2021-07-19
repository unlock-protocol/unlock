import * as sigUtil from 'eth-sig-util'

/**
 * Helper function which verifies that the signature matches the address and data
 * @param sig
 * @param data
 * @param address
 */
export const isSignatureValidForAddress = (
  sig: string,
  data: string,
  address: string
) => {
  try {
    return (
      sigUtil.recoverPersonalSignature({
        data,
        sig,
      }) === address.toLowerCase()
    )
  } catch (error) {
    console.error(error)
    return false
  }
}

export default {
  isSignatureValidForAddress,
}
