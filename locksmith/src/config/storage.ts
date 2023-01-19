import { S3Client } from '@aws-sdk/client-s3'
import config from './config'

export const storageClient = new S3Client({
  region: 'auto',
  endpoint: config.storage.endpoint!,
  credentials: {
    accessKeyId: config.storage.accessKeyId!,
    secretAccessKey: config.storage.secretAccessKey!,
  },
})
