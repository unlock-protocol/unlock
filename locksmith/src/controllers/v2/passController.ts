import { RequestHandler } from 'express'
import normalizer from '../../utils/normalizer'
import * as metadataOperations from '../../operations/metadataOperations'
import networks from '@unlock-protocol/networks'
import { createWalletPassObject } from '../../operations/generate-pass/android/createPassObject'
import { generateQrCodeUrl } from '../../utils/qrcode'
import logger from '../../logger'
import { getOrCreateWalletClass } from '../../operations/generate-pass/android/passClassService'
import config from '../../config/config'

/**
 * Handler to generate and return a Google Wallet pass for a specified key associated with a lock.
 *
 * @param
 *   - `lockAddress` (string): address of the lock.
 *   - `network` (number): Network on which the lock is deployed.
 *   - `keyId` (string): ID of the key.
 * @param response - Express response object used to send back the generated pass URL.
 *
 * @returns A response object with status 200 and the URL to the created wallet pass object.
 *          In case of an error, it returns a response object with status 500 and an error message.
 */
export const generateGoogleWalletPass: RequestHandler = async (
  request,
  response
) => {
  try {
    // Normalize and extract the lock address, network, and key ID from the request parameters
    const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
    const network = Number(request.params.network)
    const keyId = request.params.keyId

    // Retrieve Google application credentials
    const { client_email, private_key } = config.googleApplicationCredentials!

    // Retrieve Google wallet issuer ID and class ID from the configuration
    const { googleWalletIssuerID, googleWalletClass } = config

    // Set the Google wallet class ID for the given issuer ID
    const classID = `${googleWalletIssuerID!}.${googleWalletClass}`

    // Retrieve the network name using the network ID
    const networkName = networks[network]?.name

    // Fetch metadata details for the given lock address and network
    const lockMetadata = await metadataOperations.getLockMetadata({
      lockAddress,
      network: network!,
    })

    // Destructure the necessary fields from lockMetadata
    const { name: lockName } = lockMetadata

    // Generate a signed QR code URL for verification
    const verificationUrl = await generateQrCodeUrl({
      network,
      lockAddress,
      tokenId: keyId,
    })

    // Ensure the pass class exists or create a new one if it doesn't
    await getOrCreateWalletClass(classID)

    // Create a new wallet pass object with the provided details
    const passObjectUrl = await createWalletPassObject(
      classID,
      lockName,
      networkName,
      lockAddress,
      keyId,
      verificationUrl,
      client_email,
      private_key
    )

    // Send the pass object URL in the response
    return response.status(200).send({
      passObjectUrl,
    })
  } catch (error) {
    // Log errors that occur and send a 500 Internal Server Error response
    logger.error('Error in generating android pass:', error)
    return response.status(500).send({
      message: 'Internal Server Error',
    })
  }
}
