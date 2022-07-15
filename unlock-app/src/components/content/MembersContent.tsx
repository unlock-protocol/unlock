import styled from 'styled-components'
import React, { useState, useContext, useEffect } from 'react'
import 'cross-fetch/polyfill'
import Head from 'next/head'
import { AuthenticationContext } from '../../contexts/AuthenticationContext'
import BrowserOnly from '../helpers/BrowserOnly'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import { pageTitle } from '../../constants'
import { MemberFilters } from '../../unlockTypes'
import { MetadataTable } from '../interface/MetadataTable'
import useMembers from '../../hooks/useMembers'
import LoginPrompt from '../interface/LoginPrompt'
import GrantKeysDrawer from '../creator/members/GrantKeysDrawer'
import {
  CreateLockButton,
  AccountWrapper,
} from '../interface/buttons/ActionButton'
import { Input } from '@unlock-protocol/ui'
import useDebounce from '../../hooks/useDebouce'

interface FilterProps {
  value: string
  current: string
  setFilter: (filter: string) => any
}

const Filter = ({ value, current, setFilter }: FilterProps) => {
  return (
    <StyledFilter active={current === value} onClick={() => setFilter(value)}>
      {value}
    </StyledFilter>
  )
}

interface PaginationProps {
  currentPage: number
  hasNextPage: boolean
  setCurrentPage: (page: number) => any
}

const Pagination = ({
  currentPage,
  setCurrentPage,
  hasNextPage,
}: PaginationProps) => {
  if (currentPage === 0 && !hasNextPage) {
    return null
  }
  const previousPageButton = (
    <StyledFilter
      active={currentPage === 0}
      onClick={() => setCurrentPage(currentPage - 1)}
    >
      Previous
    </StyledFilter>
  )
  const nextPageButton = (
    <StyledFilter
      active={!hasNextPage}
      onClick={() => setCurrentPage(currentPage + 1)}
    >
      Next
    </StyledFilter>
  )
  return (
    <Filters>
      Page: {currentPage} {previousPageButton} {nextPageButton}
    </Filters>
  )
}

interface MembersContentProps {
  query: any
}
export const MembersContent = ({ query }: MembersContentProps) => {
  const [filter, setFilter] = useState<string>(MemberFilters.ACTIVE)
  const { account } = useContext(AuthenticationContext)
  const [isOpen, setIsOpen] = useState(false)

  let lockAddresses: string[] = []
  if (query.locks) {
    // query.locks will be either a string or an array.
    // when there is only one value, it's a string. For any more, it's an array.
    if (typeof query.locks === 'string') {
      lockAddresses.push(query.locks)
    } else {
      lockAddresses = query.locks as any
    }
  }
  let page = 0
  if (query.page && typeof query.page === 'string') {
    page = parseInt(query.page)
  }

  return (
    <Layout title="Members">
      <Head>
        <title>{pageTitle('Members')}</title>
      </Head>

      <GrantKeysDrawer
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        lockAddresses={lockAddresses}
      />

      <BrowserOnly>
        {!account && <LoginPrompt />}
        {account && (
          <>
            <AccountWrapper>
              <Account />
              <GrantButton onClick={() => setIsOpen(!isOpen)}>
                Airdrop Keys
              </GrantButton>
            </AccountWrapper>

            <MetadataTableWrapper page={page} lockAddresses={lockAddresses} />
          </>
        )}
      </BrowserOnly>
    </Layout>
  )
}

interface MetadataTableWrapperProps {
  lockAddresses: string[]
  page: number
}

interface Filter {
  key: string
  label: string
  options?: string[]
}

const filters: Filter[] = [
  { key: 'owner', label: 'Owner' },
  { key: 'keyId', label: 'Token id' },
  {
    key: 'expiration',
    label: 'Expiration',
    options: [MemberFilters.ACTIVE, MemberFilters.EXPIRED, MemberFilters.ALL],
  },
]
/**
 * This just wraps the metadataTable component, providing the data
 * from the graph so we can separate the data layer from the
 * presentation layer.
 */
const MetadataTableWrapper = ({
  lockAddresses,
  page,
}: MetadataTableWrapperProps) => {
  const { account } = useContext(AuthenticationContext)
  const [currentPage, setCurrentPage] = useState(page)
  const [query, setQuery] = useState<string>('')
  const [filterKey, setFilteKey] = useState<string>('owner')
  const [currentFilter, setCurrentFilter] = useState<Filter>()
  const [currentOption, setCurrentOption] = useState<string>()
  const [expiration, setExpiration] = useState<MemberFilters>(
    MemberFilters.ACTIVE
  )
  const queryValue = useDebounce<string>(query)

  const { loading, list, columns, hasNextPage, isLockManager, loadMembers } =
    useMembers({
      viewer: account!,
      lockAddresses,
      expiration,
      page: currentPage,
      query: queryValue,
      filterKey,
    })

  const search = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e?.target?.value ?? ''
    setQuery(search)
  }

  const onFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const key = event?.target?.value ?? ''
    setFilteKey(key)
  }

  useEffect(() => {
    const filter = filters?.find((filter) => filterKey === filter.key)
    if (filter) {
      setCurrentFilter(filter)
    }
  }, [filterKey])

  useEffect(() => {
    if (currentFilter?.key === 'expiration') {
      setExpiration(currentOption as MemberFilters)
    }
  }, [currentFilter?.key, currentOption])

  const onOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentOption(event?.target?.value ?? '')
  }

  const options: string[] = currentFilter?.options ?? []
  // TODO: rename metadata into members inside of MetadataTable
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[200px_minmax(100px,_450px)_1fr] items-center gap-[1.5rem]">
        <span className="grid gap-1.4">
          <label htmlFor="filters" className="px-1 text-base">
            Filter by
          </label>
          <select
            name="filters"
            className="rounded-md shadow-sm border border-gray-400 hover:border-gray-500 h-[33px] text-xs"
            onChange={onFilterChange}
          >
            {filters?.map(({ key, label }) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </span>
        <div className="mt-auto">
          {options?.length ? (
            <select
              name={currentFilter?.key}
              className="rounded-md shadow-sm border border-gray-400 hover:border-gray-500 h-[33px] text-xs"
              onChange={onOptionChange}
            >
              {options?.map((option: string) => {
                return (
                  <option key={option} value={option}>
                    {option.toUpperCase()}
                  </option>
                )
              })}
            </select>
          ) : (
            <Input
              label="Filter your results"
              type="text"
              size="small"
              onChange={search}
            />
          )}
        </div>
        <div className="ml-auto">
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            hasNextPage={hasNextPage}
          />
        </div>
      </div>
      <MetadataTable
        columns={columns}
        metadata={list}
        isLockManager={isLockManager}
        lockAddresses={lockAddresses}
        loading={loading}
        loadMembers={loadMembers}
      />
    </>
  )
}

MetadataTableWrapper.defaultProps = {}

const GrantButton = styled(CreateLockButton)``

export const Filters = styled.nav`
  color: var(--grey);
  font-size: 13px;
`

interface StyledFilterProps {
  active?: boolean
}
const StyledFilter = styled.li`
  cursor: ${(props: StyledFilterProps) =>
    props.active ? 'not-allowed' : 'pointer'};
  display: inline-block;
  margin: 5px;
  color: ${(props) => (props.active ? 'var(--darkgrey)' : 'var(--blue)')};
  font-weight: ${(props) => (props.active ? '700' : '300')};
`

export default MembersContent
