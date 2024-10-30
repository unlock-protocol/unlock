import { KeyManager, Web3Service } from '@unlock-protocol/unlock-js'
import { RequestHandler, Response } from 'express'
import { z } from 'zod'
import Dispatcher from '../../fulfillment/dispatcher'
import KeyPricer from '../../utils/keyPricer'
import normalizer from '../../utils/normalizer'
import networks from '@unlock-protocol/networks'
import { UserMetadata } from './metadataController'
import { upsertUserMetadata } from '../../operations/userMetadataOperations'
import { getTotalPurchasePriceInCrypto } from '../../utils/claim'

const ClaimBody = z.object({
  data: z.string().optional(),
  recipient: z.string().optional(),
  referrer: z.string().optional(),
  email: z
    .string()
    .email()
    .transform((value) => value.toLowerCase())
    .optional(),
})

export const LOCKS_WITH_DISABLED_CLAIMS = [
  '0xAfcfff71F3e717fcDb0b6a1BF20026304fD41bEE',
].map((address) => normalizer.ethereumAddress(address))

/**
 * Claim API on free locks on chains with low transaction fees.
 * This also supports walletless airdrops.
 * @param request
 * @param response
 * @returns
 */
export const claim: RequestHandler = async (request, response: Response) => {
  const { data, recipient, email, referrer } = await ClaimBody.parseAsync(
    request.body
  )
  const network = Number(request.params.network)
  const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)

  let owner = recipient ? normalizer.ethereumAddress(recipient) : '' // recipient as default owner if present

  if (request.user && !owner) {
    owner = normalizer.ethereumAddress(request.user.walletAddress)
  }

  // By default we protect all metadata
  const protectedMetadata = {
    ...request.body,
  }
  // Remove the recipient
  delete protectedMetadata.recipient

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

  if (!owner && !email) {
    return response.status(401).send({
      message: 'You are not authenticated.',
    })
  }

  if (
    LOCKS_WITH_DISABLED_CLAIMS.indexOf(
      normalizer.ethereumAddress(lockAddress)
    ) > -1
  ) {
    return response.status(400).send({
      message: 'Claim disabled for this lock',
    })
  }

  const pricer = new KeyPricer()
  const fulfillmentDispatcher = new Dispatcher()
  const web3Service = new Web3Service(networks)

  // Check that claim is not too costly and that the lock is free
  const [canAffordGas, totalAmount, hasValidKey, totalKeysForUser] =
    await Promise.all([
      pricer.canAffordGrant(network),
      getTotalPurchasePriceInCrypto({
        lockAddress,
        network,
        recipients: [owner],
        data: [data || '0x'],
      }),
      web3Service.getHasValidKey(lockAddress, owner, network),
      web3Service.totalKeys(lockAddress, owner, network),
    ])

  if (BigInt(totalAmount) > 0) {
    return response.status(402).send({
      message: 'Lock is not free',
    })
  }

  if (!canAffordGas.canAfford) {
    return response.status(422).send({
      message: canAffordGas.reason,
    })
  }

  // Is user already has a valid key, claim will fail
  if (hasValidKey) {
    return response.status(400).send({
      message: 'User already has key',
    })
  }

  // Save metadata if applicable
  if (Object.keys(protectedMetadata).length > 0) {
    const metadata = await UserMetadata.parseAsync({
      public: {},
      protected: {
        ...protectedMetadata,
      },
    })
    await upsertUserMetadata({
      network,
      userAddress: owner,
      lockAddress,
      metadata,
    })
  }

  const expired = !hasValidKey && totalKeysForUser > 0
  const keyManagerAddress = networks[network].keyManagerAddress

  // if the key is expired, we use extend rather than purchase
  if (expired) {
    const tokenId = await web3Service.tokenOfOwnerByIndex(
      lockAddress,
      owner,
      0,
      network
    )
    return fulfillmentDispatcher.extendKey(
      lockAddress,
      tokenId,
      network,
      data || '0x',
      async (_, transactionHash) => {
        return response.send({
          transactionHash,
          owner,
        })
      }
    )
  }

  return fulfillmentDispatcher.purchaseKey(
    {
      lockAddress,
      owner,
      network,
      data,
      referrer,
      keyManager: email ? keyManagerAddress : owner,
    },
    async (_, transactionHash) => {
      return response.send({
        transactionHash,
        owner,
      })
    }
  )
}
