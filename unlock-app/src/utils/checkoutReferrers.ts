import { PaywallConfigType } from '@unlock-protocol/core'
import { ethers } from 'ethers'

export interface ReferrerNameResolver {
  resolveName: (name: string) => Promise<{ address?: string } | null>
}

export const resolveReferrer = async (
  web3Service: ReferrerNameResolver,
  referrer?: string
) => {
  if (!referrer || ethers.isAddress(referrer)) {
    return referrer
  }

  const resolvedName = await web3Service.resolveName(referrer)
  if (resolvedName?.address && ethers.isAddress(resolvedName.address)) {
    return resolvedName.address
  }

  return referrer
}

export const resolvePaywallConfigReferrers = async (
  paywallConfig: PaywallConfigType,
  web3Service: ReferrerNameResolver
) => {
  const locks = Object.fromEntries(
    await Promise.all(
      Object.entries(paywallConfig.locks || {}).map(
        async ([lockAddress, lockConfig]) => [
          lockAddress,
          {
            ...lockConfig,
            referrer: await resolveReferrer(web3Service, lockConfig.referrer),
          },
        ]
      )
    )
  )

  return {
    ...paywallConfig,
    referrer: await resolveReferrer(web3Service, paywallConfig.referrer),
    locks,
  }
}
