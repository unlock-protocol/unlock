import { useQuery } from '@tanstack/react-query'
import {
  KeyOrderBy,
  OrderDirection,
  SubgraphService,
} from '@unlock-protocol/unlock-js'
import dayjs from 'dayjs'
import { ethers } from 'ethers'
import { MAX_UINT } from '~/constants'
import { useConfig } from '~/utils/withConfig'

interface Options {
  lockAddress?: string
  owner?: string
  networks?: number[]
}

export type Key = NonNullable<ReturnType<typeof useKeys>['keys']>[0]

export const useKeys = ({ networks, lockAddress, owner }: Options) => {
  const config = useConfig()
  const subgraph = new SubgraphService(config.networks)
  const { data: keys, isLoading: isKeysLoading } = useQuery(
    ['keys', owner, networks, lockAddress],
    async () => {
      const keys = await subgraph.keys(
        {
          first: 500,
          where: {
            lock: lockAddress?.toLowerCase(),
            owner: owner?.toLowerCase(),
          },
          orderBy: KeyOrderBy.Expiration,
          orderDirection: OrderDirection.Desc,
        },
        {
          networks,
        }
      )
      const items = keys.map((item) => {
        const isExpired =
          item.expiration !== MAX_UINT
            ? dayjs.unix(parseInt(item.expiration)).isBefore(dayjs())
            : false
        const isERC20 =
          item.lock.tokenAddress &&
          item.lock.tokenAddress !== ethers.constants.AddressZero

        const isExtendable =
          item.lock.version >= 11 && item.expiration !== MAX_UINT

        const isRenewable =
          item.lock.version >= 11 && item.expiration !== MAX_UINT && isERC20

        return {
          ...item,
          isExpired,
          isRenewable,
          isERC20,
          isExtendable,
        }
      })
      return items
    }
  )

  return {
    isKeysLoading,
    keys,
  }
}
