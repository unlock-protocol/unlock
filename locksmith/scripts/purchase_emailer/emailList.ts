import { Querier } from './querier'
import { generateKeyMetadata } from '../../src/operations/metadataOperations'

export async function extractEmails(serviceEndpoint: string) {
  let querier = new Querier(serviceEndpoint)
  let results = await querier.query()

  let keysData = results.map(async (result: any) => {
    let keyMetadata = await generateKeyMetadata(
      result.lockAddress,
      result.keyId,
      true,
      ''
    )

    return {
      lockAddress: result.lockAddress,
      keyId: result.keyId,
      emailAddress: keyMetadata.userMetadata.protected.emailAddress,
    }
  })

  return Promise.all(keysData)
}
