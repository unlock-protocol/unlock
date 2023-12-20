import { ethers } from 'ethers'
import { RequestHandler } from 'express'
import { getAllReceipts } from '../../utils/receipts'
import { Receipt, ReceiptBase } from '../../models'
import normalizer from '../../utils/normalizer'
import { quickAddJob } from 'graphile-worker'
import { Pool } from 'pg'
import config from '../../config/config'
import { Payload } from '../../models/payload'

export const allReceipts: RequestHandler = async (request, response) => {
  const network = Number(request.params.network)
  const lockAddress = ethers.utils.getAddress(request.params.lockAddress)
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
  const payload = new Payload()
  payload.payload = {
    status: 'pending',
    result: [],
  }
  const { id } = await payload.save()

  await quickAddJob(
    {
      pgPool: new Pool({
        connectionString: config.databaseUrl,
        // @ts-expect-error - type is not defined properly
        ssl: config.database?.dialectOptions?.ssl,
      }),
    },
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
  response.redirect(`/v2/receipts/download/${id}`)
}

export const downloadReceipts: RequestHandler = async (request, response) => {
  const result = await Payload.findByPk(request.params.id)
  if (!result) {
    response.sendStatus(404)
    return
  }
  response.json(result.payload)
}
