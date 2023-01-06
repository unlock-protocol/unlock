import multer from 'multer'
import multerS3 from 'multer-s3'
import express from 'express'
import { storageClient } from '../../config/storage'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'

const router = express.Router()

export const upload = multer({
  storage: multerS3({
    s3: storageClient,
    acl: 'public-read',
    bucket: 'publicbucket',
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
          originamName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          etag: file.etag,
          versionId: file.versionId,
          encoding: file.encoding,
        }
      }),
    })
  }
)

export default router
