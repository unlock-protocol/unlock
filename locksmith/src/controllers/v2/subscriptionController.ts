import { Response, Request } from 'express-serve-static-core'
import { KeySubscription } from '../../models'
import normalizer from '../../utils/normalizer'
import {
  SubgraphService,
  Web3Service,
  getErc20BalanceForAddress,
  getErc20Decimals,
  getAllowance,
} from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import { ethers } from 'ethers'
import { Op } from 'sequelize'

export class SubscriptionController {
  /**
   * Get an active crypto or fiat subscription associated with the key. This will return next renewal date, possible number of renewals, approved number of renewals, and other details.
   */
  async getSubscription(request: Request, response: Response) {
    const network = Number(request.params.network)
    const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
    const keyId = Number(request.params.keyId)
    const userAddress = normalizer.ethereumAddress(request.user!.walletAddress)
    const subgraphService = new SubgraphService(networks)

    const key = await subgraphService.key(
      {
        where: {
          tokenId: keyId.toString(),
          lock: lockAddress.toLowerCase(),
          owner: userAddress.toLowerCase(),
        },
      },
      {
        network,
      }
    )

    // If no key is found or not erc20 or version < 11 which we don't fully support, return nothing.
    if (
      !key ||
      key.lock.tokenAddress === ethers.constants.AddressZero ||
      parseInt(key.lock.version) < 11
    ) {
      return response.status(200).send({})
    }

    const web3Service = new Web3Service(networks)
    const provider = web3Service.providerForNetwork(network)
    const [userBalance, decimals, userAllowance] = await Promise.all([
      getErc20BalanceForAddress(key.lock.tokenAddress, userAddress, provider),
      getErc20Decimals(key.lock.tokenAddress, provider),
      getAllowance(
        key.lock.tokenAddress,
        key.lock.address,
        provider,
        userAddress
      ),
    ])

    const balance = ethers.utils.formatUnits(userBalance, decimals)

    const price = key.lock.price
    const next = parseInt(key.expiration)

    // Approved renewals
    const approvedRenewals = userAllowance.eq(ethers.constants.MaxUint256)
      ? userAllowance.toString()
      : userAllowance.div(price).toString()

    const info = {
      next,
      balance,
      price: ethers.utils.formatUnits(price, decimals),
    }

    const subscription = await KeySubscription.findOne({
      where: {
        keyId,
        lockAddress,
        network,
        userAddress,
        recurring: {
          [Op.gt]: 0,
        },
      },
    })

    // if card subscription is found, return that.
    if (subscription) {
      return response.status(200).send({
        ...info,
        approvedRenewals: subscription.recurring,
        possibleRenewals: subscription.recurring,
        type: 'fiat',
      })
    }

    // Otherwise return the details on crypto subscription if any.
    const result = {
      ...info,
      approvedRenewals: approvedRenewals,
      possibleRenewals: ethers.BigNumber.from(userBalance)
        .div(price)
        .toString(),
      type: 'crypto',
    }

    return response.status(200).send(result)
  }

  /**
   * Cancel stripe subscription associated with key.
   */
  async cancelStripeSubscription(request: Request, response: Response) {
    const network = Number(request.params.network)
    const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
    const keyId = Number(request.params.keyId)
    const userAddress = normalizer.ethereumAddress(request.user!.walletAddress)
    await KeySubscription.destroy({
      where: {
        keyId,
        lockAddress,
        network,
        userAddress,
      },
    })
    return response.sendStatus(204)
  }
}
