import { generateKeyMetadata } from '../../operations/metadataOperations'

const config = require('../../../config/config')

export const generateMetadata = async (
  address: string,
  id: string,
  network: number
) => {
  return generateKeyMetadata(address, id, false, config.metadataHost, network)
}
