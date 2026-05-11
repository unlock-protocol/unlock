import { Request, Response } from 'express'
import { Receipt } from '../../models/receipt'
import * as z from 'zod'
import Normalizer from '../../utils/normalizer'
import logger from '../../logger'
import * as receiptOperations from '../../../src/operations/receiptOperations'
import { sendEmail } from '../../operations/wedlocksOperations'
import config from '../../config/config'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkHtml from 'remark-html'

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

export const EmailReceiptBody = z.object({
  subject: z.string().min(1),
  content: z.string().min(1),
})

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
      response.status(200).json(receiptDetails)
      return
    } catch (err: unknown) {
      logger.error(err instanceof Error ? err.message : err)
      response.status(500).send({
        message: 'Impossible to retrieve receipt details.',
      })
      return
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
      response.status(200).json({
        ...dataValues,
      })
      return
    } catch (err: unknown) {
      logger.error(err instanceof Error ? err.message : err)
      response.status(500).json({
        message: 'Failed to save purchaser details.',
      })
      return
    }
  }

  async emailReceipt(request: Request, response: Response) {
    const network = Number(request.params.network || 1)
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
    const hash = request.params.hash ?? ''
    const { subject, content } = await EmailReceiptBody.parseAsync(request.body)

    try {
      const receiptDetails = await receiptOperations.getReceiptDetails({
        lockAddress,
        network,
        hash,
      })
      const recipient = receiptDetails.purchaser?.email

      if (!recipient) {
        response.status(400).json({
          message: 'No email address is available for this receipt.',
        })
        return
      }

      const receiptUrl = new URL('/receipts', config.unlockApp)
      receiptUrl.searchParams.set('address', lockAddress)
      receiptUrl.searchParams.set('network', network.toString())
      receiptUrl.searchParams.append('hash', hash)

      const keychainUrl = new URL('/keychain', config.unlockApp)
      const htmlContent = await unified()
        .use(remarkParse)
        .use(remarkHtml)
        .process(content)

      const sent = await sendEmail({
        network,
        template: 'custom',
        failoverTemplate: 'debug',
        recipient,
        params: {
          content: String(htmlContent?.value),
          keychainUrl: keychainUrl.toString(),
          lockAddress,
          network: network.toString(),
          receiptUrl: receiptUrl.toString(),
          subject,
        },
      })

      response.status(200).json({
        sent,
      })
      return
    } catch (err: unknown) {
      logger.error(err instanceof Error ? err.message : err)
      response.status(500).json({
        message: 'Failed to email receipt.',
      })
      return
    }
  }
}
