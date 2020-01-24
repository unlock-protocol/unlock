import { generateKeyMetadata } from './generateKeyMetadata'

export async function extractEmails(results: any[]): Promise<Key[]> {
  let keysData = results.map((result: any) =>
    enrichKeyWithEmailAddress(result.lockAddress, result.keyId)
  )

  let filteredKeys = (await Promise.all(keysData)).filter(key => key.emailAddress != null)
  return filteredKeys
}

async function enrichKeyWithEmailAddress(
  lockAddress: string,
  keyId: string
): Promise<any> {
  let keyMetadata: any

  try {
    keyMetadata = await generateKeyMetadata(lockAddress, keyId)
  } catch (_) {
    keyMetadata = {}
  }

  return {
    lockAddress: lockAddress,
    keyId: keyId,
    emailAddress: keyMetadata.userMetadata?.protected?.emailAddress,
  }
}
