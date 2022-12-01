import forge from 'node-forge'
import configure from '../config'

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
    const signature = Buffer.from(signed, 'base64').toString()
    const md = forge.md.sha1.create()
    md.update(email, 'utf8')
    const publicKeyPem = Buffer.from(
      base64WedlocksPublicKey,
      'base64'
    ).toString()
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem)
    return publicKey.verify(md.digest().bytes(), signature)
  } catch (e) {
    return false
  }
}

export default {
  verifyEmailSignature,
}
