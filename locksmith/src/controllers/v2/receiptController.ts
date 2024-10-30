import { Request, Response } from 'express'
import { Receipt } from '../../models/receipt'
import * as z from 'zod'
import Normalizer from '../../utils/normalizer'
import logger from '../../logger'
import * as receiptOperations from '../../../src/operations/receiptOperations'

export const PurchaserBody = z.object({
  fullname: z.string().nullish().default(''),
  businessName: z.string().nullish().default(''),
  addressLine1: z.string().nullish().default(''),
  addressLine2: z.string().nullish().default(''),
  city: z.string().nullish().default(''),
  state: z.string().nullish().default(''),
  zip: z.string().nullish().default(''),
  country: z.string().nullish().default(''),
})

export type PurchaserBodyProps = z.infer<typeof PurchaserBody>

export class ReceiptController {
  // Get Receipts details by providing `network` / `lockAddress` / `hash`
  async getReceipt(request: Request, response: Response) {
    const network = Number(request.params.network || 1)
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
    const hash = request.params.hash

    try {
      const receiptDetails = await receiptOperations.getReceiptDetails({
        lockAddress,
        network,
        hash,
      })

      // Returns receipts details
      return response.status(200).json(receiptDetails)
    } catch (err: any) {
      logger.error(err.message)
      return response.status(500).send({
        message: 'Impossible to retrieve receipt details.',
      })
    }
  }

  // Save Purchaser  details for Receipts
  async savePurchaser(request: Request, response: Response) {
    const network = Number(request.params.network || 1)
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
    const hash = request.params.hash ?? ''
    const props = await PurchaserBody.parseAsync(request.body)

    try {
      const [{ dataValues }] = await Receipt.upsert(
        {
          lockAddress,
          network,
          hash,
          ...props,
        },
        {
          conflictFields: ['hash'],
          returning: true,
        }
      )
      return response.status(200).json({
        ...dataValues,
      })
    } catch (err: any) {
      logger.error(err.message)
      return response.status(500).json({
        message: 'Failed to save purchaser details.',
      })
    }
  }
}
