import { Request, Response } from 'express'
import { ReceiptsBase } from '../../models/receiptsBase'
import Normalizer from '../../utils/normalizer'
export class ReceiptsBaseController {
  async get(request: Request, response: Response) {
    const network = Number(request.params.network || 1)
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
    const hash = request.params.hash

    const receipt = await ReceiptsBase.findOne({
      where: {
        lockAddress,
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
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
    const hash = request.params.hash
    const noParams = Object.keys(request.body).length === 0

    if (noParams) {
      return response.status(404)
    }

    try {
      const {
        supplier = '',
        vat = '',
        servicePerformed = '',
        addressLine1 = '',
        addressLine2 = '',
        state = '',
        city = '',
        zip = '',
        country = '',
      } = (request.body as ReceiptsBase) ?? {}

      if (!supplier.length) {
        return response.status(404).send({
          message: 'Missing supplier',
        })
      }

      if (!vat.length) {
        return response.status(404).send({
          message: 'Missing vat',
        })
      }

      if (!servicePerformed.length) {
        return response.status(404).send({
          message: 'Missing service performed',
        })
      }

      if (!addressLine1.length) {
        return response.status(404).send({
          message: 'Missing address',
        })
      }

      if (!zip.length) {
        return response.status(404).send({
          message: 'Missing zip',
        })
      }

      if (!state.length) {
        return response.status(404).send({
          message: 'Missing state',
        })
      }

      if (!city.length) {
        return response.status(404).send({
          message: 'Missing city',
        })
      }

      if (!country.length) {
        return response.status(404).send({
          message: 'Missing country',
        })
      }

      const receiptBase = await ReceiptsBase.findOne({
        where: {
          lockAddress,
          network,
          hash,
        },
      })

      if (receiptBase) {
        // receipts already exists need to be updated
        await ReceiptsBase.upsert(
          {
            lockAddress,
            network,
            hash,
            ...request.body,
          },
          {
            returning: true,
          }
        )
        return response.status(200).json({
          message: 'Receipts updated.',
        })
      } else {
        // receipts not exists need to be sets
        const receiptBase = new ReceiptsBase()

        receiptBase.supplier = request?.body?.supplier
        receiptBase.vat = request?.body?.vat
        receiptBase.servicePerformed = request?.body?.servicePerformed
        receiptBase.addressLine1 = request?.body?.addressLine1
        receiptBase.addressLine2 = request?.body?.addressLine2
        receiptBase.city = request?.body?.city
        receiptBase.zip = request?.body?.zip
        receiptBase.state = request?.body?.state
        receiptBase.country = request?.body?.country

        await receiptBase.save()

        return response.status(200).send({
          message: 'Receipts details saved',
        })
      }
    } catch (err) {
      return response.status(500)
    }
  }
}
