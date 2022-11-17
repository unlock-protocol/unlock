import { Request, Response } from 'express'
import { networks } from '@unlock-protocol/networks'
import { z } from 'zod'
import { ethers } from 'ethers'

import Dispatcher from '../../fulfillment/dispatcher'

const MAX_LIMIT = ethers.constants.MaxUint256.toString()

const LockContractOptions = z.object({
  expirationDuration: z.string().optional().default(MAX_LIMIT),
  keyPrice: z.string(),
  maxNumberOfKeys: z.string().optional().default(MAX_LIMIT),
  creator: z.string().optional(),
  name: z.string(),
  currencyContractAddress: z.string().nullable().optional().default(null),
  publicLockVersion: z.number().optional(),
})

export class ContractsController {
  async createLockContract(request: Request, response: Response) {
    const network = Number(request.params.network)
    // Only supported on goerli, polygon, and gnosis.
    if (![5, 137, 100].includes(network)) {
      return response.status(404).send({
        message: `Network ${
          networks[network]?.name || network
        } is not supported.`,
      })
    }

    const user = request.user?.walletAddress
    const lock = await LockContractOptions.parseAsync(request.body)
    const dispatcher = new Dispatcher()

    const transactionHash = await dispatcher.createLockContract(network, {
      name: lock.name,
      currencyContractAddress: lock.currencyContractAddress,
      maxNumberOfKeys: lock.maxNumberOfKeys,
      creator: lock.creator || user,
      keyPrice: lock.keyPrice,
      expirationDuration: lock.maxNumberOfKeys,
      publicLockVersion: lock.publicLockVersion,
    })

    return response.status(201).send({
      transactionHash,
    })
  }
}
