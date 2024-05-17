import multer from 'multer'
import multerS3 from 'multer-s3'
import path from 'path'
import fs from 'fs'
import express from 'express'
import { storageClient } from '../../config/storage'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import crypto from 'node:crypto'
import config, { isDevelopment } from '../../config/config'
import { createRateLimitMiddleware } from '../../utils/middlewares/rateLimit'

const router = express.Router()

const rateLimiter = createRateLimitMiddleware({
  prefix: 'upload_images',
  // 10 requests within 10 seconds.
  duration: 10,
  requests: 10,
})

let storage

console.log('NODE_ENV:', isDevelopment)

if (!isDevelopment) {
  console.log('Using S3 storage')
  storage = multerS3({
    // @ts-expect-error Type 'import("/home/unlock/node_modules/@aws-sdk/client-s3/dist-types/S3Client").S3Client' is not assignable to type 'import("/home/unlock/node_modules/@types/multer-s3/node_modules/@aws-sdk/client-s3/dist-types/S3Client").S3Client'.
    s3: storageClient,
    bucket: config.storage.bucket,
    // ... other multerS3 options
  })
} else {
  console.log('Using local storage')
  const uploadDir = path.join(__dirname, '../../../uploads')

  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  storage = multer.diskStorage({
    destination: uploadDir,
    filename: function (_, file, callback) {
      crypto.pseudoRandomBytes(16, function (err, raw) {
        if (err) return callback(err, '')
        callback(null, raw.toString('hex') + path.extname(file.originalname))
      })
    },
  })
}

export const upload = multer({
  limits: {
    fileSize: 104857600, // 100MB
  },
  fileFilter(_, file, callback) {
    const type = file.mimetype?.trim().split('/')[0]
    if (['image', 'video'].includes(type.toLowerCase())) {
      callback(null, true)
    } else {
      callback(
        new Error('Invalid file type. Only image and video are supported.')
      )
    }
  },
  storage: storage,
})

router.post(
  '/upload',
  authenticatedMiddleware,
  rateLimiter,
  // Upload upto 5 images at once
  upload.array('images', 5),
  (request, response) => {
    if (isDevelopment && request.file) {
      const filename = request.file.filename
      // @ts-ignore
      request.file.location = `${request.protocol}://${request.get('host')}/uploads/${filename}`
    }
    return response.status(201).send({
      results: Object.values(request.files || []).map((file: any) => {
        return {
          url: file.location,
          publicUrl: new URL(
            `/${file.key}`,
            config.storage.publicHost!
          ).toString(),
          originamName: file.originalname,
          mimetype: file.mimetype,
          contentType: file.contentType,
          size: file.size,
          key: file.key,
          metadata: file.metadata,
          encoding: file.encoding,
        }
      }),
    })
  }
)

export default router
