import { Web3Service } from '@unlock-protocol/unlock-js'
import { z } from 'zod'
import normalizer from '../../utils/normalizer'
import networks from '@unlock-protocol/networks'
import { Request, Response } from 'express'
import { ethers } from 'ethers'

const PurchaseBody = z.object({
  address: z.string(),
})

export const purchase = async (request: Request, response: Response) => {
  const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
  const network = Number(request.params.network)
  const web3Service = new Web3Service(networks)

  const { address } = await PurchaseBody.parseAsync(request.body)
  const recipient = normalizer.ethereumAddress(address)
  const referrer = normalizer.ethereumAddress(
    networks[network]?.multisig || recipient
  )
  const data = '0x'

  // Get the price of that user
  const keyPrice = await web3Service.purchasePriceFor({
    lockAddress,
    userAddress: recipient,
    network,
    data,
    referrer,
  })

  // TODO: check version of the lock as it may impact the signature
  // TODO: simulate tx to identify if it would fail!
  // We need to return the params for the purchase function
  const params = {
    _values: [keyPrice],
    _recipients: [recipient],
    _referrers: [referrer],
    _keyManagers: [ethers.ZeroAddress],
    _data: [[]],
  }

  response.status(200).send(params)
  return
}
