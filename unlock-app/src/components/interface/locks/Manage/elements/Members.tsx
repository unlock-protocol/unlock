import { useQueries } from '@tanstack/react-query'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { ImageBar } from './ImageBar'
import { MemberCard } from './MemberCard'
import { paginate } from '~/utils/pagination'
import { PaginationBar } from './PaginationBar'
import React from 'react'
import { ExpirationStatus } from './FilterBar'
import Link from 'next/link'
import { subgraph } from '~/config/subgraph'
import { storage } from '~/config/storage'
import { Placeholder } from '@unlock-protocol/ui'

interface MembersProps {
  lockAddress: string
  network: number
  loading: boolean
  setPage: (page: number) => void
  page: number
  filters?: FilterProps
  onAirdropKeys?: () => void
}

export interface FilterProps {
  query: string
  filterKey: string
  expiration: ExpirationStatus
}

export const Members = ({
  lockAddress,
  network,
  loading: loadingFilters,
  setPage,
  page,
  onAirdropKeys,
  filters = {
    query: '',
    filterKey: 'owner',
    expiration: ExpirationStatus.ALL,
  },
}: MembersProps) => {
  const getMembers = async () => {
    const keys = await storage.keys(
      network,
      lockAddress,
      filters.query,
      filters.filterKey,
      filters.expiration
    )
    return keys.data
  }

  const getLockSettings = async () => {
    return await storage.getLockSettings(network, lockAddress)
  }

  const [
    { isLoading, data: members = [] },
    { isLoading: isLockLoading, data: lock },
    { isLoading: isLoadingSettings, data: { data: lockSettings = {} } = {} },
  ] = useQueries({
    queries: [
      {
        queryFn: getMembers,
        queryKey: ['getMembers', lockAddress, network, filters],
        onError: () => {
          ToastHelper.error(`Can't load members, please try again`)
        },
      },

      {
        queryFn: () => {
          return subgraph.lock(
            {
              where: {
                address: lockAddress,
              },
            },
            { network }
          )
        },
        queryKey: ['getSubgraphLock', lockAddress, network],
        onError: () => {
          ToastHelper.error('Unable to fetch lock from subgraph')
        },
      },
      {
        queryKey: ['getLockSettings', lockAddress, network],
        queryFn: async () => getLockSettings(),
      },
    ],
  })

  const loading =
    isLockLoading || isLoading || loadingFilters || isLoadingSettings

  const noItems = members?.length === 0 && !loading

  const hasActiveFilter =
    filters?.expiration !== 'all' ||
    filters?.filterKey !== 'owner' ||
    filters?.query?.length > 0

  const checkoutLink = `/locks/checkout-url?lock=${lockAddress}&network=${network}`

  if (loading) {
    return (
      <>
        <Placeholder.Root>
          <Placeholder.Card />
          <Placeholder.Card />
          <Placeholder.Card />
          <Placeholder.Card />
          <Placeholder.Card />
        </Placeholder.Root>
      </>
    )
  }

  if (noItems && !hasActiveFilter) {
    return (
      <ImageBar
        src="/images/illustrations/no-member.svg"
        alt="No members"
        description={
          <span>
            Lock is deployed. You can{' '}
            <button
              onClick={onAirdropKeys}
              className="outline-none cursor-pointer text-brand-ui-primary"
            >
              Airdrop Keys
            </button>{' '}
            or{' '}
            <Link href={checkoutLink}>
              <span className="outline-none cursor-pointer text-brand-ui-primary">
                Share a purchase link
              </span>
            </Link>{' '}
            to your community.
          </span>
        }
      />
    )
  }

  if (noItems && hasActiveFilter) {
    return (
      <ImageBar
        src="/images/illustrations/no-member.svg"
        alt="No results"
        description="No key matches your filter."
      />
    )
  }

  const pageOffset = page - 1 ?? 0
  const { items, maxNumbersOfPage } = paginate({
    items: members,
    page: pageOffset,
    itemsPerPage: 30,
  })

  const showPagination = maxNumbersOfPage > 1

  return (
    <div className="grid grid-cols-1 gap-6">
      {(items || [])?.map((metadata: any) => {
        const { token, keyholderAddress: owner, expiration } = metadata ?? {}
        return (
          <MemberCard
            key={metadata.token}
            token={token}
            owner={owner}
            expiration={expiration}
            version={lock?.version}
            metadata={metadata}
            lockAddress={lockAddress!}
            network={network}
            expirationDuration={lock?.expirationDuration}
            lockSettings={lockSettings}
          />
        )
      })}
      {showPagination && (
        <PaginationBar
          maxNumbersOfPage={maxNumbersOfPage}
          setPage={setPage}
          page={page}
        />
      )}
    </div>
  )
}
