import { ethers } from 'ethers'
import { RequestHandler } from 'express'
import { getAllReceipts } from '../../utils/receipts'
import { Receipt, ReceiptBase } from '../../models'

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

  const items = receipts.map((item) => {
    const receiptData = receiptsDataMap[item.id]
    return {
      ...item,
      fullName: receiptData.fullname,
      vat: receiptBaseData?.vat,
      service: receiptBaseData?.servicePerformed,
      supplier: receiptBaseData?.supplierName,
      supplierAddress: `${receiptBaseData?.addressLine1}\n${receiptBaseData}`,
    }
  })
  return response.json({ items })
}
