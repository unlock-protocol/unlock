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
  const { data, recipient } = await ClaimBody.parseAsync(request.body)
  const network = Number(request.params.network)
  const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)

  let owner = recipient ? normalizer.ethereumAddress(recipient) : '' // recipient as default owner if present

  if (request.user && !owner) {
    owner = normalizer.ethereumAddress(request.user.walletAddress)
  }

  const email = request.body.email?.toString().toLowerCase()

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

  if (LOCKS_WITH_DISABLED_CLAIMS.indexOf(lockAddress.toLowerCase()) > -1) {
    return response.status(400).send({
      message: 'Claim disabled for this lock',
    })
  }

  // First check that the lock is indeed free and that the gas costs is low enough!
  const pricer = new KeyPricer()
  const totalAmount = await getTotalPurchasePriceInCrypto({
    lockAddress,
    network,
    recipients: [owner],
    data: [data || '0x'],
  })

  if (totalAmount.gt(0)) {
    return response.status(400).send({
      message: 'Lock is not free',
    })
  }

  const fulfillmentDispatcher = new Dispatcher()

  // Check that claim is not too costly
  const [hasEnoughToPayForGas, canAffordGas] = await Promise.all([
    fulfillmentDispatcher.hasFundsForTransaction(network),
    pricer.canAffordGrant(network),
  ])
  if (!hasEnoughToPayForGas) {
    return response.status(500).send({
      message: 'Not enough funds to pay for gas',
    })
  }

  if (!canAffordGas) {
    return response.status(500).send({
      message: 'Gas fees too high!',
    })
  }

  if (!owner && !email) {
    return response.status(401).send({
      message: 'You are not authenticated.',
    })
  }

  if (Object.keys(protectedMetadata).length > 0) {
    // Save metadata if applicable
    const metadata = await UserMetadata.parseAsync({
      public: {},
      protected: {
        ...protectedMetadata,
      },
    })
    console.log(metadata)
    await upsertUserMetadata({
      network,
      userAddress: owner,
      lockAddress,
      metadata,
    })
  }
  const web3Service = new Web3Service(networks)

  const [member, total] = await Promise.all([
    web3Service.getHasValidKey(lockAddress, owner, network),
    web3Service.totalKeys(lockAddress, owner, network),
  ])

  const expired = !member && total > 0

  // Is user already has a valid key, claim will likely fail
  if (member) {
    return response.status(400).send({
      message: 'User already has key',
    })
  }

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
  } else {
    return fulfillmentDispatcher.purchaseKey(
      {
        lockAddress,
        owner,
        network,
        data,
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
}
