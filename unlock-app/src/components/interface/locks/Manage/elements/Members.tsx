import { useQuery } from '@tanstack/react-query'
import { ToastHelper } from '@unlock-protocol/ui'
import { ImageBar } from './ImageBar'
import { MemberCard as DefaultMemberCard, MemberCardProps } from './MemberCard'
import { paginate } from '~/utils/pagination'
import { PaginationBar } from './PaginationBar'
import { ApprovalStatus, ExpirationStatus } from './FilterBar'
import { graphService } from '~/config/subgraph'
import { locksmith } from '~/config/locksmith'
import { Placeholder } from '@unlock-protocol/ui'
import { PAGE_SIZE } from '@unlock-protocol/core'
import { useBatchNameResolver } from '~/hooks/useNameResolver'
import { useLockManager } from '~/hooks/useLockManager'

/**
 * Default placeholder component when there are no members and no filters applied
 */
const DefaultNoMemberNoFilter = () => {
  return (
    <ImageBar
      src="/images/illustrations/no-member.svg"
      alt="No members"
      description="Your lock does not have any member yet."
    />
  )
}

/**
 * Default placeholder component when there are no members matching the filters
 */
const DefaultNoMemberWithFilter = () => {
  return (
    <ImageBar
      src="/images/illustrations/no-member.svg"
      alt="No results"
      description="No key matches your filter."
    />
  )
}

export interface FilterProps {
  query: string
  filterKey: string
  expiration: ExpirationStatus
  approval: ApprovalStatus
}

export interface MembersProps {
  // Core props
  lockAddress: string
  network: number
  loading: boolean
  setPage: (page: number) => void
  page: number

  // Optional filter props
  filters?: FilterProps

  // Optional customization props - allowing components to be replaced
  MemberCard?: React.FC<MemberCardProps>
  NoMemberNoFilter: React.FC<{
    toggleAirdropKeys: () => void
    isManager: boolean
  }>
  NoMemberWithFilter?: React.FC
  MembersActions?: React.FC<{ keys: any; filters: FilterProps }>

  // Optional pre-loaded data - allows parent components to provide data directly
  centralizedLockData?: {
    lock?: any
    lockSettings?: any
    isManager?: boolean
    eventDetails?: any
    metadata?: any
  } | null
}

/**
 * Fetches paginated keys/members data for a lock
 */
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

/**
 * Fetches lock settings
 */
const getLockSettings = async (network: number, lockAddress: string) => {
  return await locksmith.getLockSettings(network, lockAddress)
}

/**
 * Component for displaying and managing lock members/keys
 */
export const Members = ({
  // Core props
  lockAddress,
  network,
  loading: loadingFilters,
  setPage,
  page,

  // Optional props with defaults
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
  centralizedLockData,
}: MembersProps) => {
  // Fetch lock manager status once for all cards - this avoids redundant API calls
  const { isManager } = useLockManager({
    lockAddress,
    network,
  })

  // Lock info query - this doesn't need to change with pagination
  // Only runs if centralizedLockData wasn't provided
  const { data: lockData, isLoading: isLoadingLockData } = useQuery({
    queryKey: ['lockData', lockAddress, network],
    enabled: !centralizedLockData && !!lockAddress && !!network,
    queryFn: async () => {
      const [subgraphLock, lockSettingsResponse] = await Promise.all([
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
        lock: subgraphLock,
        lockSettings: lockSettingsResponse?.data || {},
      }
    },
    refetchOnWindowFocus: false,
  })

  // Use centralized data if available (handle null case)
  const effectiveLockData = centralizedLockData || lockData

  // Members query - changes with pagination and filters
  const { data: membersData, isLoading: isLoadingMembers } = useQuery({
    queryKey: [
      `page-${page}`,
      'membersData',
      lockAddress,
      network,
      filters.query,
      filters.filterKey,
      filters.expiration,
      filters.approval,
    ],
    queryFn: async () => {
      const membersResponse = await getMembers(
        network,
        lockAddress,
        filters,
        page
      )

      // Extract unique member addresses
      const memberAddresses = (membersResponse?.keys || []).map(
        (metadata: any) => metadata.keyholderAddress
      )

      return {
        keys: membersResponse?.keys || [],
        meta: membersResponse?.meta || {},
        memberAddresses,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes stale time for members data
    refetchOnWindowFocus: false,
  })

  // Batch name resolution
  const { resolvedNames } = useBatchNameResolver(
    membersData?.memberAddresses || []
  )

  // Combined loading state - we don't include name resolution loading as we want to show results as they stream in
  const isLoading = isLoadingLockData || isLoadingMembers || loadingFilters

  if (isLoading) {
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
  if (!effectiveLockData || !membersData) {
    ToastHelper.error('There was an error fetching attendees data')
    return (
      <ImageBar
        alt="Fetch error"
        src="/images/illustrations/no-member.svg"
        description={<span>Unable to fetch lock members from subgraph.</span>}
      />
    )
  }

  const { keys, meta } = membersData
  const { lock, lockSettings } = effectiveLockData
  const noItems = (keys?.length || 0) === 0
  const hasActiveFilter =
    filters?.approval !== 'minted' ||
    filters?.expiration !== 'all' ||
    filters?.filterKey !== 'owner' ||
    filters?.query?.length > 0

  // Render appropriate empty state based on filter status
  if (noItems) {
    if (!hasActiveFilter) {
      return (
        <NoMemberNoFilter toggleAirdropKeys={() => {}} isManager={isManager} />
      )
    }

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

  // Calculate pagination parameters
  const { maxNumbersOfPage } = paginate({
    page: meta?.page || 0,
    itemsPerPage: meta?.byPage || PAGE_SIZE,
    totalItems: meta?.total || 0,
  })

  /**
   * Get resolved name with fallback
   * Will show the address if name resolution is still in progress
   */
  const getResolvedNameWithFallback = (address: string): string => {
    return resolvedNames[address] || address
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Render actions component if provided */}
      {MembersActions && <MembersActions filters={filters} keys={keys} />}

      {/* Render member cards */}
      {(keys || []).map((metadata: any) => {
        const { token, keyholderAddress: owner, expiration } = metadata ?? {}

        // Avoid redundant prop spreading
        const memberCardProps: MemberCardProps = {
          token,
          owner,
          expiration,
          version: lock?.version,
          metadata,
          lockAddress,
          network,
          expirationDuration: lock?.expirationDuration,
          lockSettings,
          resolvedName: getResolvedNameWithFallback(owner),
          isManager,
        }

        return <MemberCard key={token || owner} {...memberCardProps} />
      })}

      {/* Pagination controls */}
      <PaginationBar
        maxNumbersOfPage={maxNumbersOfPage}
        setPage={setPage}
        page={page}
      />
    </div>
  )
}
