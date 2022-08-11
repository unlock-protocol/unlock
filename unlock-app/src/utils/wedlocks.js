import forge from 'node-forge'
import { Base64 } from 'js-base64'
import { config } from '../config/app'

/**
 * Verifies that an email was indeed signed by wedlocks
 */
export const verifyEmailSignature = (
  email,
  signed,
  base64WedlocksPublicKey
) => {
  if (!base64WedlocksPublicKey) {
    const config = configure()
    base64WedlocksPublicKey = config.base64WedlocksPublicKey
  }
  try {
    const signature = Base64.decode(signed)
    const md = forge.md.sha1.create()
    md.update(email, 'utf8')
    const publicKeyPem = Base64.decode(base64WedlocksPublicKey)
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem)
    return publicKey.verify(md.digest().bytes(), signature)
  } catch (e) {
    return false
  }
}

export default {
  verifyEmailSignature,
}
