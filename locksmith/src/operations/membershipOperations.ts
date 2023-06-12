import { ethers } from 'ethers'
import * as subscriptionOperations from './subscriptionOperations'

const MAX_UINT = ethers.constants.MaxUint256.toString()

export const getMembershipState = async ({
  key,
  tokenAddress,
  network,
  lockAddress,
  tokenId,
}: {
  key: any
  tokenAddress: string
  network: number
  lockAddress: string
  tokenId: string
}) => {
  const isERC20 = tokenAddress && tokenAddress !== ethers.constants.AddressZero

  const isRenewable =
    Number(key?.lock?.version) >= 11 && key?.expiration !== MAX_UINT && isERC20

  const [subscription] =
    await subscriptionOperations.getSubscriptionsForLockByOwner({
      tokenId,
      lockAddress,
      network,
    })

  let currency = ''
  let isAutoRenewable = false
  let isRenewableIfReApproved = false

  // TODO: need new version of the lock contract to get the value easily
  const isRenewableIfRePurchased = false

  // get subscription and check for renews
  if (subscription) {
    const possible = ethers.BigNumber.from(subscription.possibleRenewals)
    const approved = ethers.BigNumber.from(subscription.approvedRenewals)

    isAutoRenewable = approved.gte(0) && possible.gte(0)

    isRenewableIfReApproved = approved.lte(0)

    currency = subscription.balance.symbol
  }

  return {
    currency,
    isRenewable,
    isAutoRenewable,
    isRenewableIfReApproved,
    isRenewableIfRePurchased,
  }
}
