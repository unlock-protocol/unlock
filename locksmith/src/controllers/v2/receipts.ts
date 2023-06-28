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

  const receiptsMap = receipts.reduce((map, receipt) => {
    map[receipt.hash] = receipt
    return map
  }, {})

  return response.json({ receipts })
}
