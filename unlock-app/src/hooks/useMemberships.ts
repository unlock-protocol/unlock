import { useQuery } from '@tanstack/react-query'
import {
  PaywallConfigType,
  PaywallLocksConfigType,
} from '@unlock-protocol/core'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface MembershipOptions {
  account: string | undefined
  paywallConfig: PaywallConfigType
}

export const getMembership = async (
  web3Service: Web3Service,
  lockAddress: string,
  account: string,
  lockNetwork: number
) => {
  const [member, total, tokenId] = await Promise.all([
    web3Service.getHasValidKey(lockAddress, account!, lockNetwork),
    web3Service.totalKeys(lockAddress, account!, lockNetwork),
    web3Service.getTokenIdForOwner(lockAddress, account!, lockNetwork),
  ])
  const expired = !member && total > 0
  return {
    lock: lockAddress,
    expired,
    member,
    network: lockNetwork,
    tokenId: tokenId ? tokenId.toString() : null,
  }
}

export const getMemberships = async (
  web3Service: Web3Service,
  locks: PaywallLocksConfigType,
  account: string,
  network = 1
) => {
  return Promise.all(
    Object.entries(locks).map(async ([lockAddress, props]) => {
      if (!account) {
        return {
          lock: lockAddress,
          expired: false,
          member: false,
          network: props.network || network,
          tokenId: null,
        }
      }
      const lockNetwork = props.network || network
      return getMembership(web3Service, lockAddress, account, lockNetwork)
    })
  )
}

export const useMemberships = ({
  account,
  paywallConfig,
}: MembershipOptions) => {
  const web3Service = useWeb3Service()
  return useQuery({
    queryKey: ['memberships', account, JSON.stringify(paywallConfig)],
    queryFn: () =>
      getMemberships(
        web3Service,
        paywallConfig.locks,
        account!,
        paywallConfig.network
      ),
    enabled: !!account,
  })
}
