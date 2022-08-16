import networks from '@unlock-protocol/networks'
import { Lock } from '@unlock-protocol/types'
import React, { ChangeEvent, useContext } from 'react'
import { useQuery } from 'react-query'
import AuthenticationContext from '~/contexts/AuthenticationContext'
import { network } from '~/propTypes'
import { addressMinify } from '~/utils/strings'
import { GraphServiceContext } from '~/utils/withGraphService'

interface LocksByNetworkProps {
  label?: string
  owner: string
  onChange: (lock: any, network: number) => void
}

const LocksByNetworkPlaceholder = () => {
  return (
    <div className="flex flex-col gap-2 w-1/2">
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
  const { network: currentNetwork, changeNetwork } = useContext(
    AuthenticationContext
  )

  const graphService = useContext(GraphServiceContext)

  const { isLoading, data: locks } = useQuery(
    [owner],
    async () => {
      const items = Object.values(networks)
        .filter(({ subgraphURI }) => !subgraphURI?.includes('localhost'))
        .map(async ({ id, subgraphURI }) => {
          graphService.connect(subgraphURI)
          const locksByNetwork = await graphService.locksByManager(owner)
          return [id, locksByNetwork as any]
        })
      return Promise.all(items)
    },
    {
      refetchInterval: false,
    }
  )

  if (isLoading) {
    return <LocksByNetworkPlaceholder />
  }

  const onOptionChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    if (!network) return
    const id = e?.target?.value
    if (typeof onChange === 'function') {
      let selected: any = null
      let selectedNetwork: any = null
      locks?.map(([network, items]) => {
        if (selected) return
        selected = items.find((item: any) => item.id === id)
        selectedNetwork = network
      })

      // change network before switch to the lock if has a different network
      if (selectedNetwork !== currentNetwork) {
        await changeNetwork(networks[selectedNetwork])
      }
      onChange(selected, selectedNetwork)
    }
  }

  return (
    <div className="flex flex-col gap-2 w-1/2">
      <span className="text-lg">{label}</span>
      <select
        name="form block form-select"
        className="block w-full box-border rounded-lg transition-all shadow-sm border border-gray-400 hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none flex-1 pl-4 py-2 text-base"
        onChange={onOptionChange}
        defaultValue=""
      >
        <option value="" disabled>
          Choose Lock
        </option>
        {locks?.map(([networkId, items]) => {
          if (!items?.length) return null
          return items.map(
            ({ id, name, address }: Lock & { id: string }, index: number) => {
              const minifiedAddress = addressMinify(address || '')
              const networkName = networks[networkId]?.name ?? '-'
              return (
                <option key={`${address}-${networkName}`} value={id}>
                  {`${networkName} - ${name} - ${minifiedAddress}`}
                </option>
              )
            }
          )
        })}
      </select>
    </div>
  )
}
