import { Request, Response } from 'express'
import { ReceiptsBase } from '../../models/receiptsBase'
import Normalizer from '../../utils/normalizer'
import * as z from 'zod'

export const ReceiptBody = z.object({
  supplier: z.string().optional(),
  vat: z.string().optional(),
  servicePerformed: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
})

export class ReceiptsBaseController {
  // Save Supplier details for Receipts
  async saveSupplier(request: Request, response: Response) {
    const network = Number(request.params.network || 1)
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
    const id = 12

    try {
      const props = await ReceiptBody.parseAsync(request.body)

      console.log('before')
      await ReceiptsBase.upsert(
        // @ts-ignore
        {
          id,
          network,
          lockAddress,
        },
        {
          conflictFields: ['id'],
          returning: true,
        }
      ).catch((err) => {
        console.log(err)
      })
      return response.status(200)
    } catch (err) {
      console.log(err)
      return response.status(500)
    }
  }
}
