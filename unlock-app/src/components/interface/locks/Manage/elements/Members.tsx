import { useQuery } from '@tanstack/react-query'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { ImageBar } from './ImageBar'
import { MemberCard as DefaultMemberCard, MemberCardProps } from './MemberCard'
import { paginate } from '~/utils/pagination'
import { PaginationBar } from './PaginationBar'
import { ApprovalStatus, ExpirationStatus } from './FilterBar'
import { graphService } from '~/config/subgraph'
import { locksmith } from '~/config/locksmith'
import { Placeholder } from '@unlock-protocol/ui'
import { PAGE_SIZE } from '@unlock-protocol/core'

const DefaultNoMemberNoFilter = () => {
  return (
    <ImageBar
      src="/images/illustrations/no-member.svg"
      alt="No members"
      description="Your lock does not have any member yet."
    />
  )
}

const DefaultNoMemberWithFilter = () => {
  return (
    <ImageBar
      src="/images/illustrations/no-member.svg"
      alt="No results"
      description="No key matches your filter."
    />
  )
}

interface MembersProps {
  lockAddress: string
  network: number
  loading: boolean
  setPage: (page: number) => void
  page: number
  filters?: FilterProps
  MemberCard?: React.FC<MemberCardProps>
  NoMemberNoFilter?: React.FC
  NoMemberWithFilter?: React.FC
  MembersActions?: React.FC<{ keys: any; filters: FilterProps }>
}

export interface FilterProps {
  query: string
  filterKey: string
  expiration: ExpirationStatus
  approval: ApprovalStatus
}

// Function to fetch the paginated keys for members.
const getMembers = async (
  network: number,
  lockAddress: string,
  filters: FilterProps,
  page: number
) => {
  const { query, filterKey, expiration, approval } = filters
  const response = await locksmith.keysByPage(
    network,
    lockAddress,
    query,
    filterKey,
    expiration,
    approval,
    page - 1, // API starts at 0
    PAGE_SIZE
  )
  return response.data
}

// Function to fetch lock settings.
const getLockSettings = async (network: number, lockAddress: string) => {
  return await locksmith.getLockSettings(network, lockAddress)
}

export const Members = ({
  lockAddress,
  network,
  loading: loadingFilters,
  setPage,
  page,
  filters = {
    query: '',
    filterKey: 'owner',
    expiration: ExpirationStatus.ALL,
    approval: ApprovalStatus.MINTED,
  },
  MemberCard = DefaultMemberCard,
  NoMemberWithFilter = DefaultNoMemberWithFilter,
  NoMemberNoFilter = DefaultNoMemberNoFilter,
  MembersActions,
}: MembersProps) => {
  // Consolidated query that fetches members, subgraph lock info, and lock settings
  const { data, isLoading, error } = useQuery({
    queryKey: ['attendeesData', lockAddress, network, page, filters],
    queryFn: async () => {
      const [membersResponse, subgraphLock, lockSettingsResponse] =
        await Promise.all([
          getMembers(network, lockAddress, filters, page),
          graphService.lock(
            {
              where: {
                address: lockAddress,
              },
            },
            { network }
          ),
          getLockSettings(network, lockAddress),
        ])
      return {
        keys: membersResponse?.keys || [],
        meta: membersResponse?.meta || {},
        lock: subgraphLock,
        lockSettings: lockSettingsResponse?.data || {},
      }
    },
    placeholderData: (previousData) => previousData,
  })

  // While the query is loading, show placeholders.
  if (isLoading || loadingFilters) {
    return (
      <>
        <Placeholder.Root>
          {Array.from({ length: 5 }).map((_, index) => (
            <Placeholder.Card key={index} />
          ))}
        </Placeholder.Root>
      </>
    )
  }

  // If an error occurred in the query, display an error image.
  if (error) {
    ToastHelper.error('There was an error fetching attendees data')
    return (
      <ImageBar
        alt="Fetch error"
        src="/images/illustrations/no-member.svg"
        description={<span>Unable to fetch lock members from subgraph.</span>}
      />
    )
  }

  const { keys, meta, lock, lockSettings } = data || {}
  const noItems = (keys?.length || 0) === 0
  const hasActiveFilter =
    filters?.approval !== 'minted' ||
    filters?.expiration !== 'all' ||
    filters?.filterKey !== 'owner' ||
    filters?.query?.length > 0

  if (noItems && !hasActiveFilter) {
    return <NoMemberNoFilter />
  }

  if (noItems && hasActiveFilter) {
    return (
      <>
        <NoMemberWithFilter />{' '}
        <PaginationBar
          maxNumbersOfPage={
            paginate({
              page: meta?.page || 0,
              itemsPerPage: meta?.byPage || PAGE_SIZE,
              totalItems: meta?.total || 0,
            }).maxNumbersOfPage
          }
          setPage={setPage}
          page={page}
        />
      </>
    )
  }

  const { maxNumbersOfPage } = paginate({
    page: meta?.page || 0,
    itemsPerPage: meta?.byPage || PAGE_SIZE,
    totalItems: meta?.total || 0,
  })

  return (
    <div className="flex flex-col gap-6">
      {MembersActions ? <MembersActions filters={filters} keys={keys} /> : null}

      {(keys || []).map((metadata: any) => {
        const { token, keyholderAddress: owner, expiration } = metadata ?? {}
        return (
          <MemberCard
            key={metadata.token || owner}
            token={token}
            owner={owner}
            expiration={expiration}
            version={lock?.version}
            metadata={metadata}
            lockAddress={lockAddress}
            network={network}
            expirationDuration={lock?.expirationDuration}
            lockSettings={lockSettings}
          />
        )
      })}
      <PaginationBar
        maxNumbersOfPage={maxNumbersOfPage}
        setPage={setPage}
        page={page}
      />
    </div>
  )
}
