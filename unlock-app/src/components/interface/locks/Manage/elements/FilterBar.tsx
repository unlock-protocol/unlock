import { Button, Input, Select } from '@unlock-protocol/ui'
import { MdFilterList as FilterIcon } from 'react-icons/md'
import { BiSearch as SearchIcon } from 'react-icons/bi'
import { useEffect, useState } from 'react'
import { MemberFilter } from '~/unlockTypes'
import { useDebounce } from 'react-use'
import { getAddressForName } from '~/hooks/useEns'
import React from 'react'
import { FilterProps } from './Members'

interface FilterBarProps {
  setFilters?: (filters: FilterProps) => void
  setLoading?: (loading: boolean) => void
  setPage: (page: number) => void
  page?: number
  filters?: FilterProps
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
  { key: 'tokenId', label: 'Token id' },
  { key: 'email', label: 'Email', onlyLockManager: true },
  {
    key: 'checkedInAt',
    label: 'Checked in time',
    hideSearch: true,
    onlyLockManager: true,
  },
]

export enum ExpirationStatus {
  ALL = 'all',
  ACTIVE = 'active',
  EXPIRED = 'expired',
}

export const FilterBar = ({
  setFilters,
  setLoading,
  filters: defaultFilters,
  setPage,
}: FilterBarProps) => {
  const [isTyping, setIsTyping] = useState(false)
  const [query, setQuery] = useState('')
  const [rawQueryValue, setRawQueryValue] = useState('')

  const [_isReady] = useDebounce(
    async () => {
      const ensToAddress = await getAddressForName(rawQueryValue)
      const search = ensToAddress || rawQueryValue
      setQuery(search)
      setIsTyping(false)
    },
    500,
    [rawQueryValue]
  )

  useEffect(() => {
    if (typeof setLoading === 'function') {
      setLoading(isTyping)
    }
  }, [setLoading, isTyping])

  const expirations = Object.values(ExpirationStatus ?? {})
  const [openSearch, setOpenSearch] = useState(false)
  const [expandFilter, setExpandFilter] = useState(false)
  const [expiration, setExpiration] = useState<ExpirationStatus>(
    defaultFilters!.expiration
  )
  const [filterKey, setFilterKey] = useState(
    defaultFilters?.filterKey ?? 'owner'
  )

  // show only allowed filter, some filter are visible only to lockManager (`email` and `checkedInAt`)
  const filters = FILTER_ITEMS.filter(
    (filter: Filter) => !filter.onlyLockManager || true
  ).map(({ key: value, label }: Filter) => ({
    value,
    label,
  }))

  useEffect(() => {
    if (typeof setFilters !== 'function') return
    setFilters({
      filterKey,
      expiration,
      query,
    })
    setPage(1) // set default page on search to show results
  }, [expiration, filterKey, query, setFilters, setPage])

  const Expiration = () => {
    return (
      <div className="flex flex-col gap-4">
        <span className="text-base">Expiration Status</span>
        <div className="flex gap-3">
          {expirations.map((value: ExpirationStatus, index) => {
            const isActive = value === expiration
            const variant = isActive ? 'primary' : 'outlined-primary'
            return (
              <Button
                key={index}
                size="small"
                variant={variant}
                onClick={() => setExpiration(value)}
              >
                {value?.toUpperCase()}
              </Button>
            )
          })}
        </div>
      </div>
    )
  }

  const disableSearch = filterKey === 'checkedInAt'

  return (
    <div className="flex flex-col gap-4 px-2 py-4 rounded-lg md:px-8 bg-ui-secondary-400">
      <div className="flex items-center md:h-12 md:justify-between">
        <div className="flex flex-col items-start gap-8 md:items-center md:flex-center md:flex-row">
          <Button
            variant="borderless"
            onClick={() => setExpandFilter(!expandFilter)}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">Filter</span>
              <FilterIcon size={18} />
            </div>
          </Button>
          {openSearch ? (
            <div className="flex flex-col gap-2 md:flex-row">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col items-start gap-2 md:items-center md:flex-row">
                  <span className="mb-1">Filter by</span>
                  <div className="w-full md:w-40">
                    <Select
                      size="small"
                      options={filters}
                      defaultValue={filterKey}
                      onChange={(filter: any) => {
                        setFilterKey(filter)
                        setRawQueryValue('')
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-auto w-80">
                <Input
                  size="small"
                  onChange={(e: any) => {
                    setIsTyping(true)
                    setRawQueryValue(e?.target?.value)
                  }}
                  value={rawQueryValue}
                  disabled={disableSearch}
                />
              </div>
            </div>
          ) : (
            <Button
              variant="borderless"
              onClick={() => setOpenSearch(true)}
              className="p-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">Search</span>
                <SearchIcon size={18} />
              </div>
            </Button>
          )}
        </div>
      </div>
      {expandFilter && filterKey !== 'tokenId' && (
        <div className="block">
          <Expiration />
        </div>
      )}
    </div>
  )
}
