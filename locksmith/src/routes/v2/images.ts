import multer from 'multer'
import multerS3 from 'multer-s3'
import express from 'express'
import { storageClient } from '../../config/storage'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import crypto from 'node:crypto'
import config from '../../config/config'

const router = express.Router()

const imageBucket = 'images'

export const upload = multer({
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
  upload.array('images'),
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
