import { Response, Request } from 'express-serve-static-core'
import { KeySubscription } from '../../models'
import normalizer from '../../utils/normalizer'
import {
  SubgraphService,
  Web3Service,
  getErc20BalanceForAddress,
  getErc20Decimals,
  getAllowance,
  getErc20TokenSymbol,
} from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import { ethers } from 'ethers'
import { Op } from 'sequelize'
import dayjs from 'dayjs'
import BigInt from 'dayjs/plugin/bigIntSupport'
import relative from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'

dayjs.extend(BigInt)
dayjs.extend(relative)
dayjs.extend(duration)

interface Amount {
  amount: string
  decimals: number
  symbol: string
}
export interface Subscription {
  next: number
  balance: Amount
  price: Amount
  approvedTime: string
  possibleRenewals: string
  approvedRenewals: string
  type: 'crypto' | 'fiat'
}

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
      return response.status(200).send({
        subscriptions: [],
      })
    }

    const web3Service = new Web3Service(networks)
    const provider = web3Service.providerForNetwork(network)
    const [userBalance, decimals, userAllowance, symbol] = await Promise.all([
      getErc20BalanceForAddress(key.lock.tokenAddress, userAddress, provider),
      getErc20Decimals(key.lock.tokenAddress, provider),
      getAllowance(
        key.lock.tokenAddress,
        key.lock.address,
        provider,
        userAddress
      ),
      getErc20TokenSymbol(key.lock.tokenAddress, provider),
    ])

    const balance = ethers.utils.formatUnits(userBalance, decimals)

    const price = key.lock.price
    const next = parseInt(key.expiration)

    // Approved renewals
    const approvedRenewalsAmount = userAllowance.div(price)

    const approvedRenewals = approvedRenewalsAmount.toString()

    const approvedTimeInSeconds = approvedRenewalsAmount.mul(
      key.lock.expirationDuration
    )

    const approvedTimeInYears = approvedTimeInSeconds
      .div(60)
      .div(60)
      .div(24)
      .div(365)

    const approvedSeconds = approvedTimeInSeconds.toNumber()

    const approvedTime = approvedTimeInYears.gt(100)
      ? 'Forever'
      : approvedSeconds <= 0
      ? 'No time approved'
      : dayjs.duration(approvedSeconds, 'seconds').humanize()

    const info = {
      next,
      approvedTime,
      balance: {
        amount: balance,
        decimals,
        symbol,
      },
      price: {
        amount: ethers.utils.formatUnits(price, decimals),
        decimals,
        symbol,
      },
    }

    const stripeSubscription = await KeySubscription.findOne({
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

    const subscriptions: Subscription[] = []

    // if card subscription is found, add it.
    if (stripeSubscription) {
      subscriptions.push({
        ...info,
        approvedRenewals: stripeSubscription.recurring?.toString(),
        possibleRenewals: stripeSubscription.recurring?.toString(),
        type: 'fiat',
      })
    }

    // Add the default crypto subscription details.
    const cryptoSubscription: Subscription = {
      ...info,
      approvedRenewals: approvedRenewals,
      possibleRenewals: ethers.BigNumber.from(userBalance)
        .div(price)
        .toString(),
      type: 'crypto',
    }

    subscriptions.push(cryptoSubscription)

    return response.status(200).send({ subscriptions })
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
