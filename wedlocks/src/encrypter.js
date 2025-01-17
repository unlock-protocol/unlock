import forge from 'node-forge'
import config from '../config'

/**
 * Encrypts data asymmetrically.
 * The private key is known by wedlocks only, while the public key can be public.
 * This way we can ensure that the data consumed by a web app was transiting thru wedlocks
 * This is used for email verification
 * @param {*} data UTF8 string
 */
export const signParam = (
  data,
  privateKeyAsPem = config.wedlocksPrivateKey
) => {
  const md = forge.md.sha1.create()
  md.update(data, 'utf8')
  const privateKey = forge.pki.privateKeyFromPem(privateKeyAsPem)
  const signature = privateKey.sign(md)
  return encodeURIComponent(Buffer.from(signature).toString('base64'))
}

export default { signParam }
