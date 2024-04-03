import { GetObjectCommand } from '@aws-sdk/client-s3'
import { Readable } from 'stream'
import { storageClient } from '../config/storage'

// Helper function for Node.js environments to convert a stream to a string
const streamToString = (stream: Readable): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunks: any[] = []
    stream.on('data', (chunk) => chunks.push(chunk))
    stream.once('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    stream.once('error', reject)
  })
}

export async function downloadJsonFromS3(
  bucketName: string,
  key: string
): Promise<object> {
  try {
    const { Body } = await storageClient.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    )

    if (Body) {
      const content = await streamToString(Body as Readable)
      return JSON.parse(content)
    } else {
      throw new Error('No body in response')
    }
  } catch (error) {
    console.error(`Error downloading JSON from S3: ${error}`)
    throw error
  }
}
