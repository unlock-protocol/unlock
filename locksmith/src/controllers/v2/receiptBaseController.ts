import { Request, Response } from 'express'
import { ReceiptBase } from '../../models/receiptBases'
import Normalizer from '../../utils/normalizer'
import * as z from 'zod'
import logger from '../../logger'
import * as receiptBasesOperations from '../../../src/operations/receiptBasesOperations'

export const SupplierBody = z.object({
  supplierName: z.string().nullish().default(''),
  prefix: z.string().nullish().default(''),
  vat: z.string().nullish().default(''),
  servicePerformed: z.string().nullish().default(''),
  addressLine1: z.string().nullish().default(''),
  addressLine2: z.string().nullish().default(''),
  city: z.string().nullish().default(''),
  state: z.string().nullish().default(''),
  zip: z.string().nullish().default(''),
  country: z.string().nullish().default(''),
  vatBasisPointsRate: z.number().min(0).max(10000).nullish().default(null),
})
export type SupplierBodyProps = z.infer<typeof SupplierBody>

export class ReceiptBaseController {
  // Get supplier details
  async getSupplier(request: Request, response: Response) {
    const network = Number(request.params.network || 1)
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)

    const receipt = await receiptBasesOperations.getSupplier(
      lockAddress,
      network
    )

    if (!receipt) {
      // no returning content
      return response.sendStatus(204)
    }

    return response.status(200).json({
      ...receipt?.dataValues,
    })
  }

  // Save Supplier details for Receipts
  async saveSupplier(request: Request, response: Response) {
    const network = Number(request.params.network || 1)
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)

    try {
      const props = await SupplierBody.parseAsync(request.body || {})
      try {
        const [{ dataValues }] = await ReceiptBase.upsert(
          {
            lockAddress,
            network,
            ...props,
          },
          {
            conflictFields: ['lockAddress'],
            returning: true,
          }
        )
        return response.status(200).json({
          ...dataValues,
        })
      } catch (err: any) {
        logger.error(err.message)
        return response.status(500).json({
          message: 'Failed to save supplier details',
        })
      }
    } catch (err: any) {
      logger.error(err.message)
      return response.status(500).json({
        message: 'Failed to save supplier details',
      })
    }
  }
}
