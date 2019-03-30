const crypto = require('crypto')

export function generate(): string {
  const buf = crypto.randomBytes(256)
  return buf.toString('hex')
}

export default {
  generate,
}
