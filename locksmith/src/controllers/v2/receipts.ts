import { ethers } from 'ethers'
import { RequestHandler } from 'express'
import { getAllReceipts, getReceiptsZipName } from '../../utils/receipts'
import { Receipt, ReceiptBase } from '../../models'
import normalizer from '../../utils/normalizer'
import { Payload } from '../../models/payload'
import { addJob } from '../../worker/worker'
import config from '../../config/config'
import { downloadFileFromS3 } from '../../utils/s3'

export const allReceipts: RequestHandler = async (request, response) => {
  const network = Number(request.params.network)
  const lockAddress = ethers.getAddress(request.params.lockAddress)
  const [receipts, receiptsData, receiptBaseData] = await Promise.all([
    getAllReceipts({
      network,
      lockAddress,
    }),
    Receipt.findAll({
      where: {
        lockAddress,
        network,
      },
    }),
    ReceiptBase.findOne({
      where: {
        lockAddress,
        network,
      },
    }),
  ])

  const receiptsDataMap = receiptsData.reduce<Record<string, Receipt>>(
    (map, receiptData) => {
      map[receiptData.id] = receiptData
      return map
    },
    {}
  )

  const items = receipts
    .map((item) => {
      const receiptData = receiptsDataMap[item.id]
      return {
        ...item,
        fullName: receiptData?.fullname,
        vat: receiptBaseData?.vat,
        service: receiptBaseData?.servicePerformed,
        supplier: receiptBaseData?.supplierName,
        supplierAddress:
          receiptBaseData?.addressLine1 && receiptBaseData?.addressLine2
            ? `${receiptBaseData?.addressLine1}\n${receiptBaseData}`
            : receiptBaseData?.addressLine1 ||
            receiptBaseData?.addressLine2 ||
            '',
      }
    })
    .sort((a, b) => {
      return Number(a.timestamp) - Number(b.timestamp)
    })
  return response.json({ items })
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

  if(unfinishedJob) {
    return response.json({ status: 'pending' })
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
  return response.json({ status: 'pending' })
}

export const getReceiptsStatus: RequestHandler = async (request, response) => {
  const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
  const network = Number(request.params.network || 1)

  const key = getReceiptsZipName(lockAddress, network)
  const result = await Payload.findAll({ 
      where: { payload: { key } },
      order: [['createdAt', 'DESC']],
      limit: 2
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
  const result = await Payload.findOne(
    { where: { payload: { key, status: 'success' } }, order: [['createdAt', 'DESC']] },
  )
  if (result) {
    const bucketName = config.storage.bucket

    try {
      const fileStream = await downloadFileFromS3(bucketName, key)

      response.setHeader('Content-Type', 'application/zip')
      response.setHeader('Content-Disposition', `attachment; filename=receipts.zip`)

      fileStream.pipe(response)

      fileStream.on('error', () => {
        if (!response.headersSent) {
          response.status(400).send('Failed to download file')
        }
      })

      response.on('finish', () => {
        console.log('File downloaded successfully')
      })
    } catch (error) {
      if (!response.headersSent) {
        response.status(400).send('Failed to download file')
      }
    }
  }
  else {
    response.sendStatus(404)
  }
}