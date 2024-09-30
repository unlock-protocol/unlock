import { useQuery } from '@tanstack/react-query'
import {
  PaywallConfigType,
  PaywallLocksConfigType,
} from '@unlock-protocol/core'
import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'

interface MembershipOptions {
  account: string | undefined
  paywallConfig: PaywallConfigType
}

export const getMembership = async (
  lockAddress: string,
  account: string,
  lockNetwork: number
) => {
  const web3Service = new Web3Service(networks)
  const [member, total] = await Promise.all([
    web3Service.getHasValidKey(lockAddress, account!, lockNetwork),
    web3Service.totalKeys(lockAddress, account!, lockNetwork),
  ])
  const expired = !member && total > 0
  return {
    lock: lockAddress,
    expired,
    member,
    network: lockNetwork,
  }
}

export const getMemberships = async (
  locks: PaywallLocksConfigType,
  account: string,
  network = 1
) => {
  const web3Service = new Web3Service(networks)

  return Promise.all(
    Object.entries(locks).map(async ([lockAddress, props]) => {
      if (!account) {
        return {
          lock: lockAddress,
          expired: false,
          member: false,
          network: props.network || network,
        }
      }
      const lockNetwork = props.network || network
      const [member, total] = await Promise.all([
        web3Service.getHasValidKey(lockAddress, account!, lockNetwork),
        web3Service.totalKeys(lockAddress, account!, lockNetwork),
      ])
      // if not member but total is above 0
      const expired = !member && total > 0
      return {
        lock: lockAddress,
        expired,
        member,
        network: lockNetwork,
      }
    })
  )
}

export const useMemberships = ({
  account,
  paywallConfig,
}: MembershipOptions) => {
  return useQuery({
    queryKey: ['memberships', account, JSON.stringify(paywallConfig)],
    queryFn: () =>
      getMemberships(paywallConfig.locks, account!, paywallConfig.network),
    enabled: !!account,
  })
}
