import { generateKeyMetadata } from './generateKeyMetadata'

export async function extractEmails(results: any[]): Promise<Key[]> {
  let keysData = results.map(async (result: any) => {
    let keyMetadata: any

    try {
      keyMetadata = await generateKeyMetadata(result.lockAddress, result.keyId)
    } catch (_) {
      keyMetadata = {}
    }

    return {
      lockAddress: result.lockAddress,
      keyId: result.keyId,
      emailAddress: keyMetadata.userMetadata?.protected?.emailAddress,
    } as Key
  })

  return Promise.all(keysData)
}
