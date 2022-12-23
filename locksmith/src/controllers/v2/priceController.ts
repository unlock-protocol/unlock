import { Request, Response } from 'express'
import { defiLammaPrice } from '../../utils/pricing'

export class PriceController {
  async amount(request: Request, response: Response) {
    const network = Number(request.params.network || 1)
    const amount = parseFloat(request.query.amount?.toString() || '0')
    const address =
      typeof request.query.address === 'string'
        ? request.query.address
        : undefined

    const result = await defiLammaPrice({
      network,
      amount,
      address,
    })
    return response.status(200).send({
      result,
    })
  }
}
