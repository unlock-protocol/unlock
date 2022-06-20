import * as sigUtil from 'eth-sig-util'

/**
 * Helper function which verifies that the signature matches the address and data
 * @param sig
 * @param data
 * @param address
 * @param keyGranter
 */
export const isSignatureValidForAddress = (
  sig: string,
  data: string,
  address: string,
  keyGranter?: string
) => {
  try {
    const personalSignature = sigUtil.recoverPersonalSignature({
      data,
      sig,
    })
    return (
      personalSignature === address.toLocaleLowerCase() ||
      personalSignature === keyGranter
    )
  } catch (error) {
    console.error(error)
    return false
  }
}

export default {
  isSignatureValidForAddress,
}
