import { PKPass } from 'passkit-generator'
import fetch from 'isomorphic-fetch'
import logger from '../../../logger'
import path from 'node:path'
import { getCertificates } from './getCertificates'

// Resolve the absolute path to the pass model template directory
const modelPath = path.resolve(
  __dirname,
  '../../../../src/assets/ticketModel.pass'
)

// Retrieve certificates necessary for signing the pass
const { wwdr, signerCert, signerKey, signerKeyPassphrase } = getCertificates()

// utility to retrieve an image via HTTP and return it as a Buffer
async function fetchImageAsBuffer(imageUrl: string) {
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`)
  }
  const imageArrayBuffer = await response.arrayBuffer()
  // Convert the ArrayBuffer to a Node.js Buffer
  return Buffer.from(imageArrayBuffer)
}

// Create and configure an Apple Wallet Pass
export async function createAppleWalletPass(
  lockName: string,
  networkName: string,
  lockAddress: string,
  lockThumbnailUrl: string,
  keyId: string,
  qrCodeUrl: string
) {
  try {
    // Instantiate the pass using the model and certificates
    const walletPass = await PKPass.from({
      model: modelPath,
      certificates: {
        wwdr,
        signerCert,
        signerKey,
        signerKeyPassphrase,
      },
    })

    // retrieve lock's image as thumbnail buffer
    const thumbnailBuffer = await fetchImageAsBuffer(lockThumbnailUrl)
    // Add the thumbnail image as a buffer to the pass
    walletPass.addBuffer('thumbnail.png', thumbnailBuffer)

    // Configure the pass fields
    // Set header field to display the key ID
    walletPass.headerFields.push({
      value: keyId,
      label: 'ID',
      textAlignment: 'PKTextAlignmentNatural',
      key: 'keyId',
    })

    // Set primary field to display the lock (event) name
    walletPass.primaryFields.push({
      key: 'lockName',
      label: 'Event',
      value: lockName,
    })

    // Set secondary field to display the network name
    walletPass.secondaryFields.push({
      key: 'network',
      label: 'Network',
      value: networkName,
    })

    // Set auxiliary field to display the lock address
    walletPass.auxiliaryFields.push({
      key: 'lockAddress',
      label: 'Lock Address',
      value: lockAddress,
    })

    // Configure and set the barcode
    walletPass.setBarcodes({
      message: qrCodeUrl,
      format: 'PKBarcodeFormatQR',
    })

    // Return the fully configured pass
    return walletPass
  } catch (error) {
    // Log and rethrow errors related to pass generation
    logger.error(
      'Error encountered while generating Apple Wallet Pass: ',
      error
    )
    throw new Error('Error generating Apple Wallet Pass')
  }
}
