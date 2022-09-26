import React, { useState, useContext, useEffect } from 'react'
import Head from 'next/head'
import { AuthenticationContext } from '../../contexts/AuthenticationContext'
import BrowserOnly from '../helpers/BrowserOnly'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import { pageTitle } from '../../constants'
import { MemberFilter } from '../../unlockTypes'
import { MetadataTable } from '../interface/MetadataTable'
import LoginPrompt from '../interface/LoginPrompt'
import { Input, Button } from '@unlock-protocol/ui'
import useDebounce from '../../hooks/useDebouce'
import 'cross-fetch/polyfill'
import { LocksByNetwork } from '../creator/lock/LocksByNetwork'
import { Lock } from '@unlock-protocol/types'
import { getAddressForName } from '~/hooks/useEns'
import { useQuery } from 'react-query'
import { useKeys } from '~/hooks/useKeys'
import { AirdropKeysDrawer } from '../interface/members/airdrop/AirdropDrawer'

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
  return (
    <div className="flex items-center gap-2">
      <span>{`Page: ${currentPage + 1}`}</span>
      <Button
        variant="outlined-primary"
        size="small"
        disabled={currentPage === 0}
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        Previous
      </Button>
      <Button
        variant="outlined-primary"
        size="small"
        disabled={!hasNextPage}
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  )
}

interface MembersContentProps {
  query: any
}
export const MembersContent = ({ query }: MembersContentProps) => {
  const { account } = useContext(AuthenticationContext)
  const [lockAddresses, setLockAddresses] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (query.locks) {
      // query.locks will be either a string or an array.
      // when there is only one value, it's a string. For any more, it's an array.
      if (typeof query.locks === 'string') {
        setLockAddresses(() => [query.locks])
      }

      if (typeof query.locks === 'object' && query.locks.length > 0) {
        setLockAddresses(() => query.locks)
      }
    }
  }, [])

  let page = 0
  if (query.page && typeof query.page === 'string') {
    page = parseInt(query.page)
  }
  const hasLocks = lockAddresses?.length > 0

  const onLockChange = (lock: Lock) => {
    setLockAddresses(() => [lock.address])
  }

  return (
    <Layout title="Members">
      <Head>
        <title>{pageTitle('Members')}</title>
      </Head>

      <AirdropKeysDrawer
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        lock={{
          address: lockAddresses[0],
          network: 5,
        }}
      />

      <BrowserOnly>
        {!account && <LoginPrompt />}
        {account && (
          <>
            <div className="grid items-center justify-between grid-cols-1 gap-3 sm:grid-cols-2">
              <Account />
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => setLockAddresses(() => [])}
                  disabled={!hasLocks}
                >
                  Change Lock
                </Button>

                <Button disabled={!hasLocks} onClick={() => setIsOpen(!isOpen)}>
                  Airdrop Keys
                </Button>
              </div>
            </div>

            {!hasLocks ? (
              <LocksByNetwork onChange={onLockChange} owner={account} />
            ) : (
              <MetadataTableWrapper page={page} lockAddresses={lockAddresses} />
            )}
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
  options?: MemberFilter[]
  onlyLockManager?: boolean
  hideSearch?: boolean
}

const FILTER_ITEMS: Filter[] = [
  { key: 'owner', label: 'Owner' },
  { key: 'keyId', label: 'Token id' },
  {
    key: 'expiration',
    label: 'Expiration',
    options: ['active', 'expired', 'all'],
  },
  { key: 'email', label: 'Email', onlyLockManager: true },
  {
    key: 'checkedInAt',
    label: 'Checked in time',
    hideSearch: true,
    onlyLockManager: true,
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
  const { account, network } = useContext(AuthenticationContext)
  const [currentPage, setCurrentPage] = useState(page)
  const [rawQueryValue, setRawQueryValue] = useState('')
  const [query, setQuery] = useState<string>('')
  const [filterKey, setFilteKey] = useState<string>('owner')
  const [currentFilter, setCurrentFilter] = useState<Filter>()
  const [currentOption, setCurrentOption] = useState<string>()
  const [expiration, setExpiration] = useState<MemberFilter>('all')
  const queryValue = useDebounce<string>(query)

  const {
    getKeys,
    allKeys,
    columns,
    hasNextPage,
    keysCount,
    lockManagerMapping,
  } = useKeys({
    viewer: account!,
    locks: lockAddresses,
    network: network!,
    filters: {
      query: queryValue,
      filterKey,
      expiration,
      page: currentPage,
    },
  })

  const search = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e?.target?.value || ''
    setRawQueryValue(value)
    const ensToAddress = await getAddressForName(value)
    const search = ensToAddress || value
    setQuery(search)
  }

  const onFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const key = event?.target?.value ?? ''
    setFilteKey(key)
    setCurrentPage(0)
    if (query?.length > 0) {
      setRawQueryValue('')
      setQuery('')
    }
  }

  const filters = FILTER_ITEMS.filter((filter) => {
    if (
      !filter?.onlyLockManager ||
      Object.values(lockManagerMapping ?? {}).some((status) => status)
    ) {
      return filter
    }
  })

  useEffect(() => {
    const filter = filters?.find((filter) => filterKey === filter.key)
    if (filter && filter !== currentFilter) {
      setCurrentFilter(filter)
    }
  }, [currentFilter, filterKey, filters])

  useEffect(() => {
    if (currentFilter?.key === 'expiration') {
      setExpiration((currentOption as MemberFilter) ?? 'active')
    }
  }, [currentFilter?.key, currentOption])

  const onOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentOption(event?.target?.value ?? '')
  }

  useEffect(() => {
    if (queryValue.length === 0) return
    setCurrentPage(0) // reset pagination when has query
  }, [queryValue.length])

  const { isLoading: loading, data: keys = [] } = useQuery(
    [queryValue, expiration, currentPage, filterKey, rawQueryValue],
    () => getKeys()
  )

  const options: string[] = currentFilter?.options ?? []
  const hideSearch = currentFilter?.hideSearch ?? false
  const hasSearchValue = queryValue?.length > 0 || hideSearch
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
        {!hideSearch && (
          <div className="mt-auto">
            {options?.length ? (
              <select
                name={currentFilter?.key}
                className="rounded-md shadow-sm border border-gray-400 hover:border-gray-500 h-[33px] text-xs"
                onChange={onOptionChange}
                defaultValue={filterKey ? filterKey : ''}
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
                value={rawQueryValue}
              />
            )}
          </div>
        )}
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
        metadata={keys}
        allMetadata={allKeys}
        lockManagerMapping={lockManagerMapping}
        lockAddresses={lockAddresses}
        loading={loading}
        membersCount={keysCount}
        hasSearchValue={hasSearchValue}
      />
    </>
  )
}

MetadataTableWrapper.defaultProps = {}

export default MembersContent
