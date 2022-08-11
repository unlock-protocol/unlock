import networks from '@unlock-protocol/networks'
import React, { useContext } from 'react'
import { useQuery } from 'react-query'
import { addressMinify } from '~/utils/strings'
import { GraphServiceContext } from '~/utils/withGraphService'

interface LocksByNetworkProps {
  label?: string
  owner: string
  onChange?: () => void
}

const LocksByNetworkPlaceholder = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-[14px] w-[200px] animate-pulse bg-slate-200"></div>
      <div className="h-[45px] w-full animate-pulse rounded-lg bg-slate-200"></div>
    </div>
  )
}
export const LocksByNetwork: React.FC<LocksByNetworkProps> = ({
  owner,
  label = 'Select lock',
  onChange,
}) => {
  const graphService = useContext(GraphServiceContext)

  const { isLoading, data: locks } = useQuery(
    [owner],
    async () => {
      const items = Object.values(networks).map(
        async ({ name, subgraphURI }) => {
          graphService.connect(subgraphURI)
          const locksByNetwork = await graphService.locksByManager(owner)
          return [name, locksByNetwork as any]
        }
      )
      return Promise.all(items)
    },
    {
      refetchInterval: false,
    }
  )

  if (isLoading) {
    return <LocksByNetworkPlaceholder />
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-lg">{label}</span>
      <select
        onChange={onChange}
        name="form block form-select"
        className="block w-full box-border rounded-lg transition-all shadow-sm border border-gray-400 hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none flex-1 pl-4 py-2 text-base"
      >
        {locks?.map(([networkName, items]) => {
          if (!items?.length) return null
          return items.map((item: any) => {
            const address = addressMinify(item?.address)
            return (
              <option>{`${networkName} - ${item?.name} - ${address}`}</option>
            )
          })
        })}
      </select>
    </div>
  )
}
