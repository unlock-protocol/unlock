import { RequestHandler } from 'express'
import normalizer from '../../utils/normalizer'
import * as metadataOperations from '../../operations/metadataOperations'
import networks from '@unlock-protocol/networks'
import { createWalletPassObject } from '../../operations/generate-pass/android/createPassObject'
import { generateQrCodeUrl } from '../../utils/qrcode'
import logger from '../../logger'
import { getOrCreateWalletClass } from '../../operations/generate-pass/android/passClassService'
import config from '../../config/config'
import { createAppleWalletPass } from '../../operations/generate-pass/ios/createAppleWalletPass'

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
    const { client_email, private_key } =
      config.googleWalletApplicationCredentials!

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
    response.status(200).send({
      passObjectUrl,
    })
    return
  } catch (error) {
    // Log errors that occur and send a 500 Internal Server Error response
    logger.error('Error in generating android pass:', error)
    response.status(500).send({
      message: 'Internal Server Error',
    })
    return
  }
}

/**
 * Handler to generate and return an Apple Wallet pass for a specified key associated with a lock.
 *
 * @param
 *   - `lockAddress` (string): address of the lock.
 *   - `network` (number): Network on which the lock is deployed.
 *   - `keyId` (string): ID of the key.
 * @param response - Express response object used to send back the generated pass.
 *
 * @returns A response object with status 200 and the streamable generated pass file.
 *          In case of an error, it returns a response object with status 500 and an error message.
 */
export const generateAppleWalletPass: RequestHandler = async (
  request,
  response
) => {
  try {
    // Normalize and extract the lock address, network, and key ID from the request parameters
    const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
    const network = Number(request.params.network)
    const keyId = request.params.keyId

    // Retrieve the network name using the network ID
    const networkName = networks[network]?.name

    // Fetch metadata details for the given lock address and network
    const lockMetadata = await metadataOperations.getLockMetadata({
      lockAddress,
      network: network!,
    })

    // Destructure the necessary fields from lockMetadata
    const { name: lockName, image: lockThumbnailUrl } = lockMetadata

    // Generate a signed QR code URL for verification
    const verificationUrl = await generateQrCodeUrl({
      network,
      lockAddress,
      tokenId: keyId,
    })

    // Generate an apple wallet pass with the provided details
    const walletPass = await createAppleWalletPass(
      lockName,
      networkName,
      lockAddress,
      lockThumbnailUrl,
      keyId,
      verificationUrl
    )

    // Prepare the pass for download
    const stream = walletPass.getAsStream()
    // Set headers to indicate the content type and disposition for a file download
    response.set({
      'Content-Type': walletPass.mimeType,
      'Content-Disposition': `attachment; filename="${lockName}.pkpass"`,
    })

    // Pipe the pass data stream directly to the response object
    stream.pipe(response)
    return new Promise((resolve, reject) => {
      stream.on('end', resolve)
      stream.on('error', reject)
    })
  } catch (error) {
    // Log errors that occur and send a 500 Internal Server Error response
    logger.error('Error in generating apple wallet pass:', error)
    response.status(500).send({
      message: 'Error in generating apple wallet pass',
    })
    return
  }
}
