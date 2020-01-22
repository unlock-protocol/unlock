import { Email } from './email'
import { EmailDispatch } from './models'

export async function check(key: any): Promise<boolean> {
  let dispatchedEmail = await EmailDispatch.findOne({
    where: {
      lockAddress: key.lockAddress,
      keyId: key.keyId,
      emailAddress: key.emailAddress,
    },
  })
  return dispatchedEmail !== null
}

export async function record(key: Key): Promise<boolean> {
  try {
    await EmailDispatch.create(key)
    return true
  } catch (e) {
    return false
  }
}

export function dispatch(key: Key): Promise<boolean> {
    return Email.dispatch(key)
}
