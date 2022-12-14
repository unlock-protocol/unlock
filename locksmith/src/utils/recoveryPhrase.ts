import crypto from 'crypto'

export function generate(): string {
  const buf = crypto.randomBytes(256)
  return buf.toString('hex')
}

const RecoveryPhrase = {
  generate,
}

export default RecoveryPhrase
