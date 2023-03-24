import { KeyManager, Web3Service } from '@unlock-protocol/unlock-js'
import { RequestHandler, Response } from 'express'
import { z } from 'zod'
import Dispatcher from '../../fulfillment/dispatcher'
import KeyPricer from '../../utils/keyPricer'
import normalizer from '../../utils/normalizer'
import networks from '@unlock-protocol/networks'
import { UserTokenMetadata } from '../../models'
import { UserMetadata } from './metadataController'
import { isMetadataEmpty } from '../../operations/userMetadataOperations'

const ClaimBody = z.object({
  data: z.string().optional(),
})

export const LOCKS_WITH_DISABLED_CLAIMS = [
  '0xafcfff71f3e717fcdb0b6a1bf20026304fd41bee',
]

/**
 * Claim API on free locks on chains with low transaction fees.
 * This also supports walletless airdrops.
 * @param request
 * @param response
 * @returns
 */
export const claim: RequestHandler = async (request, response: Response) => {
  const { data } = await ClaimBody.parseAsync(request.body)
  const network = Number(request.params.network)
  const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
  let owner = ''
  if (request.user) {
    owner = normalizer.ethereumAddress(request.user.walletAddress)
  }
  const email = request.body.email?.toString().toLowerCase()

  if (LOCKS_WITH_DISABLED_CLAIMS.indexOf(lockAddress.toLowerCase()) > -1) {
    return response.status(400).send({
      message: 'Claim disabled for this lock',
    })
  }

  // First check that the lock is indeed free and that the gas costs is low enough!
  const pricer = new KeyPricer()
  const pricing = await pricer.generate(lockAddress, network)
  if (pricing.keyPrice !== undefined && pricing.keyPrice > 0) {
    return response.status(400).send({
      message: 'Lock is not free!',
    })
  }

  const fulfillmentDispatcher = new Dispatcher()

  // Check that claim is not too costly
  const hasEnoughToPayForGas =
    await fulfillmentDispatcher.hasFundsForTransaction(network)
  if (!hasEnoughToPayForGas) {
    return response.status(500).send({
      message: 'Not enough funds to pay for gas',
    })
  }

  if (!(await pricer.canAffordGrant(network))) {
    return response.status(500).send({
      message: 'Gas fees too high!',
    })
  }

  if (!owner && !email) {
    return response.status(401).send({
      message: 'You are not authenticated.',
    })
  }

  // Support for walletless claims!
  if (!owner && email) {
    // We can build a recipient wallet address from the email address
    const keyManager = new KeyManager()
    owner = keyManager.createTransferAddress({
      params: {
        email,
        lockAddress,
      },
    })
  }

  if (email) {
    // Save email if applicable
    const userData = await UserTokenMetadata.findOne({
      where: {
        userAddress: owner,
        tokenAddress: lockAddress,
        chain: network,
      },
    })
    // If no metadata was set previously, we let anyone set it.
    // Can we just "merge" the data, rather than override it?
    // In any case, we do not override (and/or do not fail)
    if (isMetadataEmpty(userData?.data?.userMetadata)) {
      const metadata = await UserMetadata.parseAsync({
        public: {},
        protected: {
          email,
        },
      })
      await UserTokenMetadata.upsert(
        {
          tokenAddress: lockAddress,
          chain: network,
          userAddress: owner,
          data: {
            userMetadata: {
              ...metadata,
            },
          },
        },
        {
          returning: true,
          conflictFields: ['userAddress', 'tokenAddress'],
        }
      )
    }
  }

  const web3Service = new Web3Service(networks)
  const alreadyHasKey = await web3Service.getHasValidKey(
    lockAddress,
    owner,
    network
  )

  // Is user already has a key, claim will likely fail
  if (alreadyHasKey) {
    return response.status(400).send({
      message: 'User already has key',
    })
  }

  await fulfillmentDispatcher.purchaseKey(
    {
      lockAddress,
      owner,
      network,
      data,
    },
    async (_: any, transactionHash: string) => {
      return response.send({
        transactionHash,
        owner,
      })
    }
  )
  return response.sendStatus(200)
}
