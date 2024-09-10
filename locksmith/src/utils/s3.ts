import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
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

export async function uploadZipToS3(
  bucketName: string,
  key: string,
  zipBuffer: Buffer
) {
  try {
    await storageClient.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: zipBuffer,
        ContentType: 'application/zip',
      })
    )

    logger.info(`ZIP file uploaded successfully`)
  } catch (error) {
    logger.error(`Error uploading ZIP file to S3: ${error}`)
    throw error
  }
}

export async function downloadFileFromS3(bucketName: string, key: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    })

    const { Body } = await storageClient.send(command)
    return Body
  } catch (error) {
    logger.error(`Error downloading file from S3: ${error}`)
    throw error
  }
}
