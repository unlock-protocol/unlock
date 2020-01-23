import { Email } from './email'
import { EmailDispatch } from './models'

const blake2 = require('blake2')

export async function check(key: any): Promise<boolean> {
  let dispatchedEmail = await EmailDispatch.findOne({
    where: {
      lockAddress: key.lockAddress,
      keyId: key.keyId,
      emailAddress: hashedEmailAddress(key.emailAddress),
    },
  })
  return dispatchedEmail !== null
}

export async function record(key: Key): Promise<boolean> {
  try {
    let keyWithHashedEmailAddress = key
    keyWithHashedEmailAddress.emailAddress = hashedEmailAddress(
      key.emailAddress as string
    )

    await EmailDispatch.create(keyWithHashedEmailAddress)
    return true
  } catch (e) {
    return false
  }
}

export function dispatch(key: Key): Promise<boolean> {
  return Email.dispatch(key)
}

function hashedEmailAddress(email: string): string {
  var h = blake2.createHash('blake2b')
  h.update(Buffer.from(email.toLowerCase()))
  return h.digest('hex')
}
