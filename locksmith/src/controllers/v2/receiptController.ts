import { Request, Response } from 'express'
import { Receipt } from '../../models/receipt'
import * as z from 'zod'
import Normalizer from '../../utils/normalizer'
import logger from '../../logger'
import * as receiptOperations from '../../../src/operations/receiptOperations'

export const PurchaserBody = z.object({
  fullname: z.string().optional().default(''),
  businessName: z.string().optional().default(''),
  addressLine1: z.string().optional().default(''),
  addressLine2: z.string().optional().default(''),
  city: z.string().optional().default(''),
  state: z.string().optional().default(''),
  zip: z.string().optional().default(''),
  country: z.string().optional().default(''),
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

      // return error when supplier and purchaser details are not present
      if (!receiptDetails?.supplier && !receiptDetails?.purchaser) {
        return response.status(404).json({
          message: 'Impossible to retrieve receipt details.',
        })
      }

      // Returns details for purchaser and supplier
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
