import { ethers } from 'ethers'
import * as subscriptionOperations from './../operations/subscriptionOperations'

const MAX_UINT = ethers.constants.MaxUint256.toString()

export const getMembershipState = async ({
  key,
  tokenAddress,
  network,
  lockAddress,
  tokenId,
  owner,
}: {
  key: any
  tokenAddress: string
  network: number
  lockAddress: string
  tokenId: string
  owner: string
}) => {
  const isERC20 = tokenAddress && tokenAddress !== ethers.constants.AddressZero

  const isRenewable =
    Number(key?.lock?.version) >= 11 && key?.expiration !== MAX_UINT && isERC20

  const subscriptions =
    await subscriptionOperations.getSubscriptionsForLockByOwner({
      tokenId,
      lockAddress,
      owner,
      network,
    })

  let currency = ''
  let isAutoRenewable = false
  let isRenewableIfReApproved = false

  // TODO: need new version of the lock contract to get the value easily
  const isRenewableIfRePurchased = false

  // get subscription and check for renews
  if (subscriptions?.length) {
    const [subscription] = subscriptions ?? []

    if (subscription) {
      const possible = ethers.BigNumber.from(subscription.possibleRenewals)
      const approved = ethers.BigNumber.from(subscription.approvedRenewals)

      isAutoRenewable = approved.gte(0) && possible.gte(0)

      isRenewableIfReApproved = approved.lte(0)

      currency = subscription.balance.symbol
    }
  }

  return {
    currency,
    isRenewable,
    isAutoRenewable,
    isRenewableIfReApproved,
    isRenewableIfRePurchased,
  }
}
