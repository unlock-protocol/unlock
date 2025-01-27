import { useQuery } from '@tanstack/react-query'
import { KeyOrderBy, OrderDirection } from '@unlock-protocol/unlock-js'
import dayjs from 'dayjs'
import { graphService } from '~/config/subgraph'
import { ADDRESS_ZERO, MAX_UINT } from '~/constants'

interface Options {
  lockAddress?: string
  owner?: string
  networks?: number[]
  showTestNets?: boolean
}

export type Key = NonNullable<ReturnType<typeof useKeys>['keys']>[0]

export const useKeys = ({ networks, lockAddress, owner }: Options) => {
  const { data: keys, isPending: isKeysLoading } = useQuery({
    queryKey: ['keys', owner, networks, lockAddress],
    queryFn: async () => {
      const keys = await graphService.keys(
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
          item.lock.tokenAddress && item.lock.tokenAddress !== ADDRESS_ZERO

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
    },
  })

  return {
    isKeysLoading,
    keys,
  }
}
