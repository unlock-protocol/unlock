import { useQueries } from '@tanstack/react-query'
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
import { useEffect } from 'react'

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
  const getMembers = async () => {
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

  const getLockSettings = async () => {
    return await locksmith.getLockSettings(network, lockAddress)
  }

  const [
    {
      isPending,
      data: { keys = [], meta = {} } = { keys: [] },
      error: membersError,
    },
    { isPending: isLockLoading, data: lock, error: lockError },
    { isPending: isLoadingSettings, data: { data: lockSettings = {} } = {} },
  ] = useQueries({
    queries: [
      {
        queryFn: getMembers,
        queryKey: ['getMembers', page, lockAddress, network, filters],
      },
      {
        queryFn: () => {
          return graphService.lock(
            {
              where: {
                address: lockAddress,
              },
            },
            { network }
          )
        },
        queryKey: ['getSubgraphLock', lockAddress, network],
      },
      {
        queryKey: ['getLockSettings', lockAddress, network],
        queryFn: async () => getLockSettings(),
      },
    ],
  })

  useEffect(() => {
    if (membersError) {
      ToastHelper.error("Can't load members, please try again")
    }
  }, [membersError])

  useEffect(() => {
    if (lockError) {
      ToastHelper.error(
        `Unable to fetch lock ${lockAddress} from subgraph on network ${network}`
      )
    }
  }, [lockError, lockAddress, network])

  const loading =
    isLockLoading || isPending || loadingFilters || isLoadingSettings

  const noItems = keys?.length === 0 && !loading

  const hasActiveFilter =
    filters?.approval !== 'minted' ||
    filters?.expiration !== 'all' ||
    filters?.filterKey !== 'owner' ||
    filters?.query?.length > 0

  if (loading) {
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

  if (lockError) {
    return (
      <ImageBar
        alt="Fetch error"
        src="/images/illustrations/no-member.svg"
        description={<span>Unable to fetch lock members from subgraph.</span>}
      />
    )
  }

  const { maxNumbersOfPage } = paginate({
    page: meta.page || 0,
    itemsPerPage: meta.byPage,
    totalItems: meta.total,
  })

  if (noItems && !hasActiveFilter) {
    return <NoMemberNoFilter />
  }

  if (noItems && hasActiveFilter) {
    return (
      <>
        <NoMemberWithFilter />{' '}
        <PaginationBar
          maxNumbersOfPage={maxNumbersOfPage}
          setPage={setPage}
          page={page}
        />
      </>
    )
  }

  return (
    <div className="flex flex-col  gap-6">
      {MembersActions ? <MembersActions filters={filters} keys={keys} /> : null}

      {(keys || [])?.map((metadata: any) => {
        const { token, keyholderAddress: owner, expiration } = metadata ?? {}
        return (
          <MemberCard
            key={metadata.token || owner}
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
      <PaginationBar
        maxNumbersOfPage={maxNumbersOfPage}
        setPage={setPage}
        page={page}
      />
    </div>
  )
}
