import { Request, Response } from 'express'
import { Receipts } from '../../models/receipts'
import * as z from 'zod'
import { ReceiptsBase } from '../../models/receiptsBase'
import Normalizer from '../../utils/normalizer'

export const ReceiptBody = z.object({
  fullname: z.string().optional().default(''),
  businessName: z.string().optional().default(''),
  addressLine1: z.string().optional().default(''),
  addressLine2: z.string().optional().default(''),
  city: z.string().optional().default(''),
  state: z.string().optional().default(''),
  zip: z.string().optional().default(''),
  country: z.string().optional().default(''),
})
export class ReceiptsController {
  // Get Receipts details
  async getReceipt(request: Request, response: Response) {
    const network = Number(request.params.network || 1)
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
    const hash = request.params.hash ?? ''

    try {
      const supplier = await Receipts.findOne({
        where: {
          lockAddress,
          network,
          hash,
        },
      })

      const purchaser = await ReceiptsBase.findOne({
        where: {
          network,
          lockAddress,
        },
      })

      return response.status(200).json({
        supplier,
        purchaser,
      })
    } catch (err) {
      return response.status(500).send({
        message: 'Impossible to retrieve receipt details',
      })
    }
  }

  // Save Purchaser  details for Receipts
  async savePurchaser(request: Request, response: Response) {
    const network = Number(request.params.network || 1)
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
    const hash = request.params.hash

    try {
      const props = await ReceiptBody.parseAsync(request.body)

      await Receipts.upsert(
        {
          lockAddress,
          network,
          hash,
          ...(props as any),
        },
        {
          returning: true,
        }
      )

      return response.status(200).json({
        message: 'Receipts saved.',
      })
    } catch (err) {
      return response.status(500)
    }
  }
}
