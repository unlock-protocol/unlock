import { ethers } from 'ethers'
import { RequestHandler } from 'express'
import {
  getAllReceiptsWithSupplierData,
  getReceiptsZipName,
} from '../../utils/receipts'
import normalizer from '../../utils/normalizer'
import { Payload } from '../../models/payload'
import { addJob } from '../../worker/worker'
import config from '../../config/config'
import { downloadFileFromS3 } from '../../utils/s3'
import logger from '../../logger'

export const allReceipts: RequestHandler = async (request, response) => {
  const network = Number(request.params.network)
  const lockAddress = ethers.getAddress(request.params.lockAddress)

  const items = await getAllReceiptsWithSupplierData(network, lockAddress)

  response.json({ items })
  return
}

export const createDownloadReceiptsRequest: RequestHandler = async (
  request,
  response
) => {
  const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
  const network = Number(request.params.network || 1)
  const key = getReceiptsZipName(lockAddress, network)

  const unfinishedJob = await Payload.findOne({
    where: {
      payload: {
        status: 'pending',
        key,
      },
    },
  })

  if (unfinishedJob) {
    response.json({ status: 'pending' })
    return
  }

  const payload = new Payload()
  payload.payload = {
    status: 'pending',
    key,
    result: [],
  }
  const { id } = await payload.save()

  await addJob(
    'downloadReceipts',
    {
      lockAddress,
      network,
      id,
    },
    {
      maxAttempts: 3,
    }
  )
  response.json({ status: 'pending' })
  return
}

export const getReceiptsStatus: RequestHandler = async (request, response) => {
  const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
  const network = Number(request.params.network || 1)

  const key = getReceiptsZipName(lockAddress, network)
  const result = await Payload.findAll({
    where: { payload: { key } },
    order: [['createdAt', 'DESC']],
    limit: 2,
  })
  if (!result) {
    response.sendStatus(404)
    return
  }
  response.json(result)
}

export const downloadReceipts: RequestHandler = async (request, response) => {
  const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
  const network = Number(request.params.network || 1)

  const key = getReceiptsZipName(lockAddress, network)
  const result = await Payload.findOne({
    where: { payload: { key, status: 'success' } },
    order: [['createdAt', 'DESC']],
  })
  if (result) {
    const bucketName = config.storage.bucket

    try {
      const fileStream = await downloadFileFromS3(bucketName, key)

      if (fileStream) {
        const readableStream = fileStream as NodeJS.ReadableStream

        response.setHeader('Content-Type', 'application/zip')
        response.setHeader(
          'Content-Disposition',
          `attachment; filename=receipts.zip`
        )

        readableStream.pipe(response)

        readableStream.on('error', () => {
          if (!response.headersSent) {
            response.status(400).send('Failed to download file')
          }
        })

        response.on('finish', () => {
          logger.info('File downloaded successfully')
        })
      } else {
        response.status(400).send('Failed to download file')
      }
    } catch (error) {
      if (!response.headersSent) {
        response.status(400).send('Failed to download file')
      }
    }
  } else {
    response.sendStatus(404)
  }
}
