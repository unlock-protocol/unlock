import fs from 'fs'
import path from 'path'
import multer from 'multer'
import multerS3 from 'multer-s3'
import express from 'express'
import { storageClient } from '../../config/storage'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import crypto from 'node:crypto'
import config, { isProduction, isStaging } from '../../config/config'
import { createRateLimitMiddleware } from '../../utils/middlewares/rateLimit'

const router: express.Router = express.Router()

const rateLimiter = createRateLimitMiddleware({
  prefix: 'upload_images',
  // 10 requests within 10 seconds.
  duration: 10,
  requests: 10,
})

const dirPath = path.join(__dirname, '../../../uploads')

if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true })
}

const storage =
  !isProduction && !isStaging
    ? multer.diskStorage({
        destination: function (_, __, cb) {
          cb(null, dirPath)
        },
        filename: function (req, file, cb) {
          const filename = file.fieldname + '-' + Date.now()
          // @ts-expect-error Property 'filename' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs>'.
          req.filename = filename
          cb(null, filename)
        },
      })
    : multerS3({
        // @ts-ignore the types for these are often out of sync
        s3: storageClient,
        // Cloudflare R2 does not support other ACLs schemes. See: https://developers.cloudflare.com/r2/data-access/s3-api/api/
        // That said, we only require public-read.
        acl: 'public-read',
        bucket: config.storage.bucket,
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
      })

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
    response.status(201).send({
      results: Object.values(request.files || []).map((file: any) => {
        return {
          url: file.location,
          publicUrl:
            !isProduction && !isStaging
              ? new URL(
                  // @ts-expect-error Property 'filename' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs>'.
                  `http://localhost:8080/v2/images/files/${request.filename}`
                ).toString()
              : new URL(`/${file.key}`, config.storage.publicHost!).toString(),
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
    return
  }
)

if (!isProduction && !isStaging) {
  router.get('/files/:name', (req, res) => {
    const imageName = req.params.name
    const imagePath = path.join(dirPath, imageName)

    res.sendFile(imagePath, function (err) {
      if (err) {
        res.status(404).send('Sorry, we cannot find that image!')
      }
    })
  })
}

export default router
