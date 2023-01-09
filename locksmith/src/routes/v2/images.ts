import multer from 'multer'
import multerS3 from 'multer-s3'
import express from 'express'
import { storageClient } from '../../config/storage'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import crypto from 'node:crypto'
import config from '../../config/config'
import { createRateLimitMiddleware } from '../../utils/middlewares/rateLimit'

const router = express.Router()

const imageBucket = 'images'

const rateLimiter = createRateLimitMiddleware({
  prefix: 'upload_images',
  // 10 requests within 10 seconds.
  duration: 10,
  requests: 10,
})

export const upload = multer({
  limits: {
    fileSize: 104857600, // 100MB
  },
  fileFilter(_, file, callback) {
    const type = file.mimetype?.split('/')[0]
    if (['image', 'video'].includes(type.toLowerCase())) {
      callback(null, true)
    } else {
      callback(
        new Error('Invalid file type. Only image and video are supported.')
      )
    }
  },
  storage: multerS3({
    s3: storageClient,
    // Cloudflare R2 does not support other ACLs schemes. See: https://developers.cloudflare.com/r2/data-access/s3-api/api/
    // That said, we only require public-read.
    acl: 'public-read',
    bucket: imageBucket,
    contentType(_, file, callback) {
      callback(null, file.mimetype)
    },
    key(_, __, callback) {
      callback(null, crypto.randomUUID())
    },
    metadata(request, file, callback) {
      callback(null, {
        fieldName: file.fieldname,
        createdBy: request.user?.walletAddress,
      })
    },
  }),
})

router.post(
  '/upload',
  authenticatedMiddleware,
  rateLimiter,
  // Upload upto 5 images at once
  upload.array('images', 5),
  (request, response) => {
    return response.status(201).send({
      results: Object.values(request.files || []).map((file: any) => {
        return {
          url: file.location,
          publicUrl: new URL(
            `/${imageBucket}/${file.key}`,
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
