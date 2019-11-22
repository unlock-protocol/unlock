import { generateKeyMetadata } from '../../operations/metadataOperations'

// eslint-disable-next-line import/prefer-default-export
export const generateMetadata = async (address: string, id: string) => {
  return await generateKeyMetadata(address, id, false, 'http://example.com')
}
