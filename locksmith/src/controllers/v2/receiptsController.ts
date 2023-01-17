import { Request, Response } from 'express'
import { Receipts } from '../../models/receipts'
import Normalizer from '../../utils/normalizer'
export class ReceiptsController {
  async get(request: Request, response: Response) {
    const network = Number(request.params.network || 1)
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
    const hash = request.params.hash

    const receipt = await Receipts.findOne({
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
        fullname = '',
        businessName = '',
        addressLine1 = '',
        state = '',
        city = '',
        zip = '',
        country = '',
      } = (request.body as Receipts) ?? {}

      if (!fullname.length) {
        return response.status(404).send({
          message: 'Missing fullname',
        })
      }

      if (!businessName.length) {
        return response.status(404).send({
          message: 'Missing business name',
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

      const receipt = await Receipts.findOne({
        where: {
          lockAddress,
          network,
          hash,
        },
      })

      if (receipt) {
        // receipts already exists need to be updated
        await Receipts.upsert(
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
        const receipts = new Receipts({
          ...request.body,
        })
        await receipts.save()
      }

      return response.status(200).send({
        message: 'Receipts details saved',
      })
    } catch (err) {
      return response.status(500)
    }
  }
}
