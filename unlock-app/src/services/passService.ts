import { locksmith } from '~/config/locksmith'

export enum Platform {
  Apple = 'apple',
  Google = 'google',
}

/**
 * Generates and fetches a Google Wallet pass.
 * @param lockAddress - The blockchain address of the lock.
 * @param network - The network ID where the lock is deployed.
 * @param keyId - The key ID associated with the wallet pass.
 * @returns A promise that resolves with the URL to the Google Wallet pass.
 */
export const generateGoogleWalletPass = async (
  lockAddress: string,
  network: number,
  keyId: string
): Promise<any> => {
  try {
    const response = await locksmith.generateGoogleWalletPass(
      network,
      lockAddress,
      keyId
    )

    return response?.data?.passObjectUrl
  } catch (error) {
    console.error('Error generating Google wallet pass:', error)
    throw new Error('Failed to generate Apple wallet pass')
  }
}

/**
 * Generates and fetches an Apple Wallet pass.
 * @param lockAddress - The blockchain address of the lock.
 * @param network - The network ID where the lock is deployed.
 * @param keyId - The key ID associated with the wallet pass.
 * @param download - Boolean indicating if the pass should be downloaded directly or used for QR code generation.
 * @returns A promise that resolves with the direct download URL or the endpoint URL for QR code generation.
 */
export const generateAppleWalletPass = async (
  lockAddress: string,
  network: number,
  keyId: string
): Promise<any> => {
  try {
    const response = await locksmith.generateAppleWalletPass(
      network,
      lockAddress,
      keyId
    )

    return response.data
  } catch (error) {
    console.error('Error generating Apple wallet pass:', error)
    throw new Error('Failed to generate Apple wallet pass')
  }
}
