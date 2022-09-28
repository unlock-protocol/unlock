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
    <div className="flex flex-col w-1/2 gap-2">
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

  const { isLoading, data: locks } = useQuery([owner], async () => {
    const items = Object.values(networks)
      .filter(({ subgraphURI }) => !subgraphURI?.includes('localhost'))
      .map(async ({ id, subgraphURI }) => {
        graphService.connect(subgraphURI)
        const locksByNetwork = await graphService.locksByManager(owner, id)
        return [id, locksByNetwork as any]
      })
    return Promise.all(items)
  })

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
    <div className="flex flex-col w-1/2 gap-2">
      <span className="text-lg">{label}</span>
      <select
        name="form block form-select"
        className="box-border flex-1 block w-full py-2 pl-4 text-base transition-all border border-gray-400 rounded-lg shadow-sm hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none"
        onChange={onOptionChange}
        defaultValue=""
      >
        <option value="" disabled>
          Choose Lock
        </option>
        {locks?.map(([networkId, items]) => {
          if (!items?.length) return null
          return items.map(({ id, name, address }: Lock & { id: string }) => {
            const minifiedAddress = addressMinify(address || '')
            const networkName = networks[networkId]?.name ?? '-'
            return (
              <option key={`${address}-${networkName}`} value={id}>
                {`${networkName} - ${name} - ${minifiedAddress}`}
              </option>
            )
          })
        })}
      </select>
    </div>
  )
}
