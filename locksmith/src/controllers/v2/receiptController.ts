import { Request, Response } from 'express'
import { Receipt } from '../../models/receipt'
import * as z from 'zod'
import Normalizer from '../../utils/normalizer'
import logger from '../../logger'
import * as receiptOperations from '../../../src/operations/receiptOperations'

export type SubscribeParams = Partial<
  Record<'lockAddress' | 'network' | 'hash', string>
>
export type SubscribeRequest = Request<SubscribeParams, Record<string, string>>

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

type PurchaserProps = z.infer<typeof PurchaserBody>
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
          message: 'Impossible to retrieve receipt details. 1',
        })
      }

      // Returns details for purchaser and supplier
      return response.status(200).json(receiptDetails)
    } catch (err) {
      logger.error(err.message)
      return response.status(500).send({
        message: 'Impossible to retrieve receipt details. 2',
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
      const purchaserDetails = await receiptOperations.getPurchaserDetails({
        lockAddress,
        network,
        hash,
      })

      if (!purchaserDetails) {
        // purchaser does not exist -> create a new one
        const newPurchaser = await this.createPurchaser(props, {
          lockAddress,
          network: `${network}`,
          hash,
        })
        return response.status(201).json({
          ...newPurchaser?.dataValues,
        })
      } else {
        // update the existing details
        const [{ dataValues }] = await Receipt.upsert(
          {
            id: purchaserDetails.id,
            lockAddress,
            network,
            hash,
            ...props,
          },
          {
            returning: true,
          }
        )
        return response.status(200).json({
          ...dataValues,
        })
      }
    } catch (err) {
      logger.error(err.message)
      return response.status(500).json({
        message: 'Failed to save purchaser details.',
      })
    }
  }

  // Create a purchaser object and save it to the database.
  async createPurchaser(props: PurchaserProps, params: SubscribeParams) {
    const purchaser = new Receipt()

    purchaser.hash = params.hash ?? ''
    purchaser.lockAddress = params.lockAddress ?? ''
    purchaser.network = Number(params.network)
    purchaser.fullname = props.fullname
    purchaser.businessName = props.businessName
    purchaser.addressLine1 = props.addressLine1
    purchaser.addressLine2 = props.addressLine2
    purchaser.city = props.city
    purchaser.state = props.state
    purchaser.country = props.country
    purchaser.zip = props.zip

    await purchaser.save()

    return purchaser
  }
}
