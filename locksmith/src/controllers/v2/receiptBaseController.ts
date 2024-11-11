import { Request, Response } from 'express'
import { ReceiptBase } from '../../models/receiptBases'
import Normalizer from '../../utils/normalizer'
import * as z from 'zod'
import logger from '../../logger'
import * as receiptBasesOperations from '../../../src/operations/receiptBasesOperations'

export const SupplierBody = z.object({
  supplierName: z.string().optional().default(''),
  prefix: z.string().optional().default(''),
  vat: z.string().optional().default(''),
  servicePerformed: z.string().optional().default(''),
  addressLine1: z.string().optional().default(''),
  addressLine2: z.string().optional().default(''),
  city: z.string().optional().default(''),
  state: z.string().optional().default(''),
  zip: z.string().optional().default(''),
  country: z.string().optional().default(''),
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
      response.sendStatus(204)
      return
    }

    response.status(200).json({
      ...receipt?.dataValues,
    })
    return
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
        response.status(200).json({
          ...dataValues,
        })
        return
      } catch (err: any) {
        logger.error(err.message)
        response.status(500).json({
          message: 'Failed to save supplier details',
        })
        return
      }
    } catch (err: any) {
      logger.error(err.message)
      response.status(500).json({
        message: 'Failed to save supplier details',
      })
      return
    }
  }
}
