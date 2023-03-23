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

interface Key {
  network: number
  lockAddress: string
  owner: string
  data?: string
}

/**
 * Shared logic
 * @param response
 * @param key
 * @returns
 */
const claimKeyOnNetworkForLockAndOwner = async (
  response: Response,
  key: Key
) => {
  const { network, lockAddress, owner, data } = key
  // First check that the lock is indeed free and that the gas costs is low enough!
  const pricer = new KeyPricer()
  const pricing = await pricer.generate(lockAddress, network)
  const fulfillmentDispatcher = new Dispatcher()

  const web3Service = new Web3Service(networks)
  const alreadyHasKey = await web3Service.getHasValidKey(
    lockAddress,
    owner,
    network
  )
  if (alreadyHasKey) {
    return response.status(400).send({
      message: 'User already has key',
    })
  }

  if (LOCKS_WITH_DISABLED_CLAIMS.indexOf(lockAddress.toLowerCase()) > -1) {
    return response.status(400).send({
      message: 'Claim disabled for this lock',
    })
  }

  if (pricing.keyPrice !== undefined && pricing.keyPrice > 0) {
    return response.status(400).send({
      message: 'Lock is not free!',
    })
  }

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
      })
    }
  )
  return response.sendStatus(200)
}

/**
 * Simple claim.
 * @param request
 * @param response
 * @returns
 */
export const claim: RequestHandler = async (request, response: Response) => {
  const { data } = await ClaimBody.parseAsync(request.body)
  const network = Number(request.params.network)
  const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
  const owner = normalizer.ethereumAddress(request.user!.walletAddress)

  return claimKeyOnNetworkForLockAndOwner(response, {
    network,
    lockAddress,
    owner,
    data,
  })
}

/**
 * Walletless airdrop. We compute a recipient address from email address
 * and save the email address before airdropping the key.
 * @param request
 * @param response
 * @returns
 */
export const walletLessClaim: RequestHandler = async (
  request,
  response: Response
) => {
  const network = Number(request.params.network)
  const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
  const email = request.params.email.toLowerCase()

  const keyManager = new KeyManager()
  const userAddress = keyManager.createTransferAddress({
    params: {
      email,
      lockAddress,
    },
  })

  const userData = await UserTokenMetadata.findOne({
    where: {
      userAddress,
      tokenAddress: lockAddress,
      chain: network,
    },
  })

  // If no metadata was set previously, we let anyone set it.
  // Can we just "merge" the data, rather than override it?
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
        userAddress: userAddress,
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
  } else {
    return response.status(400).send({
      message: 'User already has data saved.',
    })
  }

  return claimKeyOnNetworkForLockAndOwner(response, {
    network,
    lockAddress,
    owner: userAddress,
  })
}
