import { generateKeyMetadata } from './generateKeyMetadata'

export async function extractEmails(results: any[]): Promise<Key[]> {
  let keysData = results.map((result: any) => enrichKeyWithEmailAddress(result))

  let filteredKeys = (await Promise.all(keysData)).filter(
    key => key.emailAddress != null
  )
  return filteredKeys
}

async function enrichKeyWithEmailAddress(key: Key): Promise<any> {
  let keyMetadata: any

  try {
    keyMetadata = await generateKeyMetadata(key.lockAddress, key.keyId)
  } catch (_) {
    keyMetadata = {}
  }

  return {
    emailAddress: keyMetadata.userMetadata?.protected?.emailAddress,
    keyId: key.keyId,
    lockAddress: key.lockAddress,
    lockName: key.lockName,
  }
}
