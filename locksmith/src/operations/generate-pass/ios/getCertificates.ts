import { Buffer } from 'buffer'
import config from '../../../config/config'
import logger from '../../../logger'

// Interface to define the structure of the certificates.
interface Certificates {
  signerCert: Buffer
  signerKey: Buffer
  wwdr: Buffer
  signerKeyPassphrase: string
}

// Cache for storing certificates once loaded.
let cache: Certificates | undefined

// Retrieve and cache certificates from configuration.
export function getCertificates(): Certificates {
  if (cache) {
    return cache
  }

  // Extract certificate information from config object with null checks.
  const { signerCertBase64, signerKeyBase64, wwdrBase64, signerKeyPassphrase } =
    config

  // Check if any configuration values are undefined and handle gracefully
  if (
    !signerCertBase64 ||
    !signerKeyBase64 ||
    !wwdrBase64 ||
    !signerKeyPassphrase
  ) {
    logger.warn(
      'Certificate configuration values are not fully set. Using dummy certificates.'
    )

    return {
      signerCert: Buffer.from('default_dummy_certificate', 'utf-8'),
      signerKey: Buffer.from('default_dummy_key', 'utf-8'),
      wwdr: Buffer.from('default_dummy_wwdr', 'utf-8'),
      signerKeyPassphrase: 'dummy_passphrase',
    }
  }

  // Decode base64-encoded certificates from the config into buffers.
  const signerCert = Buffer.from(signerCertBase64, 'base64')
  const signerKey = Buffer.from(signerKeyBase64, 'base64')
  const wwdr = Buffer.from(wwdrBase64, 'base64')

  // Store loaded certificates in cache.
  cache = {
    signerCert,
    signerKey,
    wwdr,
    signerKeyPassphrase,
  }

  // Return the newly cached certificates.
  return cache
}
