import { useMemo, useState } from 'react'
import { Input, Select, minifyAddress } from '@unlock-protocol/ui'
import { useQuery } from '@tanstack/react-query'
import { config } from '~/config/app'
import { subgraph } from '~/config/subgraph'
import { LockImage } from '../locks/Manage/elements/LockPicker'
import Link from 'next/link'
import { ethers } from 'ethers'
import { ToastHelper } from '~/components/helpers/toast.helper'
import networks from '@unlock-protocol/networks'
import { FiExternalLink as ExternalLinkIcon } from 'react-icons/fi'
import { useAuth } from '~/contexts/AuthenticationContext'

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
  customOption?: boolean
}

export function Picker({
  network,
  lockAddress,
  keyId,
  userAddress,
  onChange,
  collect = {
    key: false,
    lockAddress: true,
    network: true,
  },
  customOption = false,
}: Props) {
  const { network: connectedNetwork } = useAuth()
  const [state, setState] = useState<Partial<PickerState>>({
    lockAddress,
    network,
    keyId,
  })

  const currentNetwork = state.network || connectedNetwork || 1

  const { data: locks, isLoading: isLoadingLocks } = useQuery(
    ['locks', userAddress, currentNetwork],
    async () => {
      const locks = await subgraph.locks(
        {
          first: 100,
          where: {
            lockManagers_contains: [userAddress.toLowerCase()],
          },
        },
        {
          networks: [currentNetwork],
        }
      )
      return locks
    },
    {
      enabled: !!currentNetwork,
    }
  )

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

  const onChangeFn = (lockAddress: string) => {
    const props = {
      network: state.network,
      lockAddress: lockAddress.toString(),
      name: locksOptions.find(
        (item) =>
          item.value?.toLowerCase() === lockAddress.toString().toLowerCase()
      )?.label,
    }
    handleChange(props)
  }

  const handleChange = (newState: PickerState) => {
    const current = state
    const props = {
      ...current,
      ...newState,
    }
    setState(props)
    onChange(props)
  }

  const handleLockChange = (lockAddress: string) => {
    if (!collect?.lockAddress) return // no need to check if 'lockAddress' is not required

    const addressIsValid = lockAddress
      ? ethers.utils.isAddress(lockAddress)
      : true

    if (addressIsValid) {
      onChangeFn(lockAddress)
    } else {
      ToastHelper.error('Lock address is not valid, please check the value')
    }
  }
  const { collectionUrl, tokenUrl } = networks[currentNetwork]?.opensea ?? {}

  const openSeaCollectionUrl =
    lockAddress && collectionUrl ? collectionUrl(lockAddress) : ''
  const openSeaTokenUrl =
    state.keyId && lockAddress && tokenUrl
      ? tokenUrl(lockAddress, state.keyId)
      : ''

  const hasValidOpenSeaUrl = openSeaCollectionUrl || openSeaTokenUrl

  const showLocks =
    state.network && collect.lockAddress && (lockExists || isLoadingLocks)

  return (
    <div className="grid gap-4">
      {collect.network && (
        <Select
          label="Network"
          options={networkOptions}
          defaultValue={currentNetwork}
          onChange={(id: any) => {
            handleChange({
              network: Number(id),
            })
          }}
          description="Select the network your lock is on."
        />
      )}
      {showLocks ? (
        <Select
          key={state.network}
          label="Lock"
          options={locksOptions}
          defaultValue={lockAddress}
          loading={isLoadingLocks}
          onChange={(lockAddress: any) => {
            handleLockChange(lockAddress)
          }}
          customOption={customOption}
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
      )}
      {state.lockAddress && lockExists && collect.key && (
        <Input
          className="w-full"
          pattern="\d+"
          label="Key ID"
          description={
            <>
              <span>
                {`Enter the key ID you want to use. This can be an existing key ID
                or a new one which doesn't exist yet.`}
              </span>
              {hasValidOpenSeaUrl && (
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href={state.keyId ? openSeaTokenUrl! : openSeaCollectionUrl!}
                  className="font-semibold text-brand-ui-primary"
                >
                  <div className="flex gap-2">
                    <span>
                      {state.keyId
                        ? 'See NFT on OpenSea'
                        : ' See NFT Collection'}
                    </span>
                    <ExternalLinkIcon size={20} />
                  </div>
                </Link>
              )}
            </>
          }
          value={state.keyId}
          onChange={(event: any) => {
            event.preventDefault()
            const { value } = event.target
            handleChange({
              keyId: value,
            })
          }}
        />
      )}
    </div>
  )
}
