import { z } from 'zod'
import normalizer from '../../utils/normalizer'
import networks from '@unlock-protocol/networks'
import { Request, Response } from 'express'
import { ethers } from 'ethers'

const PurchaseBody = z.object({
  address: z.string(),
})

export const purchase = async (request: Request, response: Response) => {
  // const _lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
  const network = Number(request.params.network)

  const { address } = await PurchaseBody.parseAsync(request.body)
  console.log({ address })
  const recipient = normalizer.ethereumAddress(address)

  const referrer = normalizer.ethereumAddress(
    networks[network]?.multisig || recipient
  )

  // TODO: check version of the lock as it may impact the signature
  // TODO: simulate tx to identify if it would fail!
  // We need to return the params for the purchase function
  const params = {
    _recipients: [recipient],
    _referrers: [referrer],
    _keyManagers: [ethers.constants.AddressZero],
    _data: [[]],
  }

  return response.status(200).send(params)
}
