import { PutObjectCommand } from '@aws-sdk/client-s3'
import { storageClient } from '../config/storage'
import logger from '../logger'

export async function uploadJsonToS3(
  bucketName: string,
  key: string,
  jsonData: object
) {
  const jsonContent = JSON.stringify(jsonData)

  try {
    await storageClient.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: jsonContent,
        ContentType: 'application/json',
      })
    )

    logger.info(`JSON uploaded successfully to ${bucketName}/${key}`)
  } catch (error) {
    logger.error(`Error uploading JSON to S3: ${error}`)
    throw error
  }
}
