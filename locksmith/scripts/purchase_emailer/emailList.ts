import { Querier } from './querier'
import { generateKeyMetadata } from '../../src/operations/metadataOperations'

// DEPRECATED/STALE : DELETE ME
export async function extractEmails(serviceEndpoint: string) {
  const querier = new Querier(serviceEndpoint)
  const results = await querier.query()

  const keysData = results.map(async (result: any) => {
    const keyMetadata = await generateKeyMetadata(
      result.lockAddress,
      result.keyId,
      true,
      '',
      1
    )

    return {
      lockAddress: result.lockAddress,
      keyId: result.keyId,
      emailAddress: keyMetadata.userMetadata.protected.emailAddress,
    }
  })

  return Promise.all(keysData)
}
