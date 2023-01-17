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
      const receipts = new ReceiptsBase()

      receipts.supplier = supplier
      receipts.vat = vat
      receipts.servicePerformed = servicePerformed
      receipts.addressLine1 = addressLine1
      receipts.addressLine2 = addressLine2
      receipts.city = city
      receipts.country = country

      receipts.lockAddress = lockAddress
      receipts.network = network
      receipts.hash = hash

      await receipts.save()

      return response.status(200).send({
        message: 'Receipts details saved',
      })
    } catch (err) {
      return response.status(500)
    }
  }
}
