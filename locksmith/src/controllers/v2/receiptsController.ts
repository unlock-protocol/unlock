import { Request, Response } from 'express'
import { Receipts } from '../../models/receipts'
import * as z from 'zod'

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
  async get(request: Request, response: Response) {
    const network = Number(request.params.network || 1)
    const hash = request.params.hash

    const receipt = await Receipts.findOne({
      where: {
        network,
        hash,
      },
    })

    if (receipt) {
      return response.status(200).send(receipt)
    }

    return response.status(404).send({
      message: 'No receipts found with the provided attributes.',
    })
  }

  async save(request: Request, response: Response) {
    const network = Number(request.params.network || 1)
    const hash = request.params.hash

    try {
      const props = await ReceiptBody.parseAsync(request.body)

      await Receipts.upsert(
        {
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
