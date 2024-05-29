import { PutObjectCommand } from '@aws-sdk/client-s3'
import { storageClient } from '../config/storage'

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

    console.log(`JSON uploaded successfully to ${bucketName}/${key}`)
  } catch (error) {
    console.error(`Error uploading JSON to S3: ${error}`)
    throw error
  }
}
