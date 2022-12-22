import { useEffect, useMemo, useState } from 'react'
import { Input, Select, minifyAddress } from '@unlock-protocol/ui'
import { useQuery } from '@tanstack/react-query'
import { config } from '~/config/app'
import { subgraph } from '~/config/subgraph'
import { LockImage } from '../locks/Manage/elements/LockPicker'
import LoadingIcon from '../Loading'
import Link from 'next/link'
export interface PickerState {
  network?: number
  lockAddress?: string
  keyId?: string
  name?: string
}

type CollectionItem = 'key' | 'lockAddress' | 'network'
interface Props extends PickerState {
  userAddress: string
  onChange(state: PickerState): void
  collect?: Partial<Record<CollectionItem, boolean>>
}

export function Picker({
  network = 1,
  lockAddress,
  keyId,
  userAddress,
  onChange,
  collect = {
    key: false,
    lockAddress: true,
    network: true,
  },
}: Props) {
  const [state, setState] = useState<Partial<PickerState>>({
    lockAddress,
    network,
    keyId,
  })

  const { data: locks, isInitialLoading } = useQuery(
    ['locks', userAddress],
    async () => {
      const locks = await subgraph.locks({
        first: 100,
        where: {
          lockManagers_contains: [userAddress.toLowerCase()],
        },
      })
      return locks
    }
  )

  useEffect(() => {
    onChange(state)
  }, [state, onChange])

  const networkOptions = Object.entries(config.networks).map(
    ([id, { name: label }]: [string, any]) => ({
      label,
      value: id,
    })
  )

  const locksOptions = useMemo(() => {
    const items = (locks || [])
      .filter((item) => item.network === state.network)
      .map(({ address, name }) => {
        return {
          prepend: <LockImage lockAddress={address} />,
          label: name!,
          value: address,
          append: minifyAddress(address),
        }
      })
    return items
  }, [state.network, locks])

  const lockExists = locksOptions.length > 0

  if (isInitialLoading) {
    return <LoadingIcon />
  }

  return (
    <div className="grid gap-4">
      {collect.network && (
        <Select
          label="Network"
          options={networkOptions}
          defaultValue={network}
          onChange={(id) => {
            setState({
              network: Number(id),
            })
          }}
          description="Select the network your lock is on."
        />
      )}
      {state.network &&
        collect.lockAddress &&
        (lockExists ? (
          <Select
            key={state.network}
            label="Lock"
            options={locksOptions}
            defaultValue={lockAddress}
            onChange={(lockAddress) => {
              setState((state) => ({
                network: state.network,
                lockAddress: lockAddress.toString(),
                name: locksOptions.find(
                  (item) =>
                    item.value?.toLowerCase() ===
                    lockAddress.toString().toLowerCase()
                )?.label,
              }))
            }}
            description="Select the lock you want to use."
          />
        ) : (
          <div>
            You have not deployed locks on this network yet.{' '}
            <Link href="/locks/create">
              <span className="font-medium underline cursor-pointer">
                Deploy one now
              </span>
            </Link>
          </div>
        ))}
      {state.lockAddress && lockExists && collect.key && (
        <Input
          className="w-full"
          type="number"
          label="Key ID"
          description="Enter the key ID you want to use. This can be an existing key ID or a new one which doesn't exist yet."
          value={state.keyId}
          onChange={(event) => {
            event.preventDefault()
            const { value } = event.target
            setState((state) => ({
              ...state,
              keyId: value,
            }))
          }}
        />
      )}
    </div>
  )
}
