import { Request, Response } from 'express'
import { ReceiptBase } from '../../models/receiptBases'
import Normalizer from '../../utils/normalizer'
import * as z from 'zod'
import logger from '../../logger'
import * as receiptBasesOperations from '../../../src/operations/receiptBasesOperations'

export type SubscribeParams = Partial<
  Record<'lockAddress' | 'network' | 'hash', string>
>
export type SubscribeRequest = Request<SubscribeParams, Record<string, string>>

export const SupplierBody = z.object({
  supplierName: z.string().optional().default(''),
  vat: z.string().optional().default(''),
  servicePerformed: z.string().optional().default(''),
  addressLine1: z.string().optional().default(''),
  addressLine2: z.string().optional().default(''),
  city: z.string().optional().default(''),
  state: z.string().optional().default(''),
  zip: z.string().optional().default(''),
  country: z.string().optional().default(''),
})

type SupplierProps = z.infer<typeof SupplierBody>

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
      return response.status(404).json({
        message: 'No supplier found with the provided parameters.',
      })
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
      const props = await SupplierBody.parseAsync(request.body)

      try {
        const receipt = await receiptBasesOperations.getSupplier(
          lockAddress,
          network
        )

        if (!receipt) {
          // supplier does not exist -> create a new one
          const newSupplier = await this.createSupplier(props, {
            lockAddress,
            network: `${network}`,
          })
          return response.status(201).json({
            ...newSupplier?.dataValues,
          })
        } else {
          // update the existing details
          const [{ dataValues }] = await ReceiptBase.upsert(
            {
              id: receipt.id,
              lockAddress,
              network,
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
          message: 'Failed to save supplier details',
        })
      }
    } catch (err) {
      return response.send(500).json({
        message: 'Failed to save supplier details',
      })
    }
  }

  // Create a receipt object and save it to the database.
  async createSupplier(props: SupplierProps, params: SubscribeParams) {
    const supplier = new ReceiptBase()

    supplier.lockAddress = params.lockAddress ?? ''
    supplier.network = Number(params.network)
    supplier.supplierName = props.supplierName
    supplier.vat = props.vat
    supplier.servicePerformed = props.servicePerformed
    supplier.addressLine1 = props.addressLine1
    supplier.addressLine2 = props.addressLine2
    supplier.city = props.city
    supplier.state = props.state
    supplier.country = props.country
    supplier.zip = props.zip

    await supplier.save()

    return supplier
  }
}
