import { utils } from 'ethers'

/**
 * Helper function which verifies that the signature matches the address and data
 * @param sig
 * @param data
 * @param address
 */
export const isSignatureValidForAddress = (
  sig: string,
  data: string,
  address: string,
  locksmithSigners?: string[]
) => {
  try {
    const signer = utils.verifyMessage(data, sig).toLowerCase()

    return !!(
      signer === address.toLowerCase() ||
      (locksmithSigners &&
        locksmithSigners?.map((item) => item.toLowerCase()).includes(signer))
    )
  } catch (error) {
    console.error(error)
    return false
  }
}

export default {
  isSignatureValidForAddress,
}
