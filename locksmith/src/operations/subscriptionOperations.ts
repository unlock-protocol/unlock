import networks from '@unlock-protocol/networks'
import {
  SubgraphService,
  Web3Service,
  getAllowance,
  getErc20BalanceForAddress,
  getErc20Decimals,
  getErc20TokenSymbol,
} from '@unlock-protocol/unlock-js'
import { ethers } from 'ethers'
import { KeySubscription } from '../models'
import { Op } from 'sequelize'

import dayjs from '../config/dayjs'

interface Amount {
  amount: string
  decimals: number
  symbol: string
}

export interface Subscription {
  next: number | null
  balance: Amount
  price: Amount
  possibleRenewals: string
  approvedRenewals: string
  type: 'Crypto' | 'Stripe'
}

interface GetSubscriptionsProps {
  tokenId: string
  lockAddress: string
  network: number
}

export const getSubscriptionsForLockByOwner = async ({
  tokenId,
  lockAddress,
  network,
}: GetSubscriptionsProps): Promise<Subscription[]> => {
  const subgraphService = new SubgraphService()
  // TODO: replace with web3Service when is possible to get specific fields again
  const key = await subgraphService.key(
    {
      where: {
        tokenId,
        lock: lockAddress.toLowerCase(),
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
    return []
  }

  const web3Service = new Web3Service(networks)
  const provider = web3Service.providerForNetwork(network)
  const [userBalance, decimals, userAllowance, symbol] = await Promise.all([
    getErc20BalanceForAddress(key.lock.tokenAddress, key.owner, provider),
    getErc20Decimals(key.lock.tokenAddress, provider),
    getAllowance(key.lock.tokenAddress, key.lock.address, provider, key.owner),
    getErc20TokenSymbol(key.lock.tokenAddress, provider),
  ])

  const balance = ethers.utils.formatUnits(userBalance, decimals)

  const price = key.lock.price

  const next =
    key.expiration === ethers.constants.MaxUint256.toString()
      ? null
      : dayjs.unix(key.expiration).isBefore(dayjs())
      ? null
      : parseInt(key.expiration)

  // Approved renewals
  const numberOfRenewalsApprovedValue =
    userAllowance.gt(0) && parseFloat(price) > 0
      ? userAllowance.div(price)
      : ethers.BigNumber.from(0)

  const numberOfRenewalsApproved = numberOfRenewalsApprovedValue.toString()

  const info = {
    next,
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
      keyId: tokenId,
      lockAddress,
      network,
      userAddress: key.owner,
      recurring: {
        [Op.gt]: 0,
      },
    },
  })

  const subscriptions: Subscription[] = []

  // if card subscription is found, add it.
  if (stripeSubscription) {
    const approvedRenewals = stripeSubscription.recurring?.toString()

    subscriptions.push({
      ...info,
      approvedRenewals,
      possibleRenewals: approvedRenewals,
      type: 'Stripe',
    })
  }

  const possibleRenewals =
    // https://links.ethers.org/v5-errors-NUMERIC_FAULT-division-by-zero
    ethers.BigNumber.from(price).gt(0)
      ? ethers.BigNumber.from(userBalance).div(price).toString()
      : ethers.BigNumber.from(0).toString()

  // Add the default crypto subscription details.
  const cryptoSubscription: Subscription = {
    ...info,
    approvedRenewals: numberOfRenewalsApproved,
    possibleRenewals,
    type: 'Crypto',
  }

  subscriptions.push(cryptoSubscription)

  return subscriptions
}

export default {
  getSubscriptionsForLockByOwner,
}
