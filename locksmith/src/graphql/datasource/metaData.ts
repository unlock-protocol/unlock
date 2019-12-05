import { generateKeyMetadata } from '../../operations/metadataOperations'

const env = process.env.NODE_ENV || 'development'
const config = require('../../../config/config')[env]

export const generateMetadata = async (address: string, id: string) => {
  return generateKeyMetadata(address, id, false, config.metadataHost)
}
