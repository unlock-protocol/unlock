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
  address: string
) => {
  console.log('data', data)
  console.log('signature', sig)
  console.log('address', address)
  console.log('recovered', utils.verifyMessage(data, sig).toLowerCase())
  try {
    return (
      utils.verifyMessage(data, sig).toLowerCase() === address.toLowerCase()
    )
  } catch (error) {
    console.error(error)
    return false
  }
}

export default {
  isSignatureValidForAddress,
}
