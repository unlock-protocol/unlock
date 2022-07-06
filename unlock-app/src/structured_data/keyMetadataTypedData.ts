// Copied from usage in locksmith tests for metadataController
export default function generateKeyTypedData(message: any, messageKey: string) {
  return {
    types: {
      KeyMetadata: [],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'KeyMetadata',
    message,
    messageKey,
  }
}
