import { Button, Input, Select } from '@unlock-protocol/ui'
import { MdFilterList as FilterIcon } from 'react-icons/md'
import { BiSearch as SearchIcon } from 'react-icons/bi'
import { useEffect, useState } from 'react'
import { MemberFilter } from '~/unlockTypes'
import { useDebounce } from 'react-use'
import { getAddressForName } from '~/hooks/useEns'
import React from 'react'

interface FilterBarProps {
  setFilters?: (filters: any) => void
  setLoading?: (loading: boolean) => void
  filters?: {
    [key: string]: any
  }
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
    ExpirationStatus.ACTIVE
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
  }, [expiration, filterKey, query, setFilters])

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
    <div className="flex flex-col gap-4 px-8 py-4 rounded-lg bg-ui-secondary-400">
      <div className="flex items-center justify-between h-12">
        <div className="flex items-center gap-8">
          <Button
            className="p-0"
            variant="transparent"
            onClick={() => setExpandFilter(!expandFilter)}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">Filter</span>
              <FilterIcon size={18} />
            </div>
          </Button>
          {openSearch ? (
            <div className="flex gap-2">
              <div className="flex flex-col gap-4">
                <div className="w-40">
                  <Select
                    size="small"
                    label="Filter by"
                    options={filters}
                    defaultValue={filterKey}
                    onChange={(filter: any) => {
                      setFilterKey(filter)
                      setRawQueryValue('')
                    }}
                  />
                </div>
              </div>
              <div className="mt-auto -mb-1.5">
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
              onClick={() => setOpenSearch(true)}
              className="p-0"
              variant="transparent"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">Search</span>
                <SearchIcon size={18} />
              </div>
            </Button>
          )}
        </div>
      </div>
      {expandFilter && filterKey !== 'keyId' && (
        <div className="block">
          <Expiration />
        </div>
      )}
    </div>
  )
}
