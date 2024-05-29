import { Button, Input, Select } from '@unlock-protocol/ui'
import { MdFilterList as FilterIcon } from 'react-icons/md'
import { BiSearch as SearchIcon } from 'react-icons/bi'
import { useEffect, useState } from 'react'
import { MemberFilter } from '~/unlockTypes'
import { useDebounce } from 'react-use'
import { getAddressForName } from '~/hooks/useEns'
import React from 'react'
import { FilterProps } from './Members'
import { PaywallLocksConfigType } from '@unlock-protocol/core'
import { addressMinify } from '~/utils/strings'
import { FaFileContract } from 'react-icons/fa'

interface FilterBarProps {
  locks?: PaywallLocksConfigType
  lockAddress?: string
  hideExpirationFilter?: boolean
  hideApprovalFilter?: boolean
  setLockAddress?: (address: string) => void
  setFilters: (filters: FilterProps) => void
  setLoading?: (loading: boolean) => void
  setPage: (page: number) => void
  page?: number
  filters: FilterProps
}

interface Filter {
  key: string
  label: string
  options?: MemberFilter[]
  hideSearch?: boolean
  placeholder?: string
  show?: (filters: FilterProps) => boolean
}

const FILTER_ITEMS: Filter[] = [
  {
    key: 'owner',
    label: 'Owner',
    placeholder: 'Wallet address or ENS',
    show: () => {
      return true
    },
  },
  {
    key: 'tokenId',
    label: 'Token id',
    show: (filters) => {
      return filters.approval === 'minted'
    },
    placeholder: '123',
  },
  {
    key: 'email',
    label: 'Email',
    show: () => {
      return true
    },
    placeholder: 'your@email.com',
  },
  {
    key: 'transactionHash',
    label: 'Transaction Hash',
    show: (filters) => {
      return filters.approval === 'minted'
    },
    placeholder: '0x123...',
  },
]

export enum ExpirationStatus {
  ALL = 'all',
  ACTIVE = 'active',
  EXPIRED = 'expired',
}

export enum ApprovalStatus {
  MINTED = 'minted',
  // APPROVED = 'approved', // approved but not minted
  PENDING = 'pending',
  DENIED = 'denied',
}

interface AttributeFilterProps {
  values: any
  currentValue: string
  onChange: (value: string) => void
}

const AttributeFilter = ({
  values,
  currentValue,
  onChange,
}: AttributeFilterProps) => {
  return (
    <div className="flex gap-1 flex-wrap md:flex-nowrap">
      {Object.values(values as string[]).map((value: string, index) => {
        const isActive = value === currentValue
        const variant = isActive ? 'borderless-primary' : 'borderless'
        return (
          <Button
            key={index}
            size="small"
            variant={variant}
            onClick={() => {
              return onChange(value as string)
            }}
          >
            {value}
          </Button>
        )
      })}
    </div>
  )
}

export const FilterBar = ({
  locks,
  lockAddress,
  hideExpirationFilter = false,
  hideApprovalFilter = true,
  setLockAddress,
  setFilters,
  setLoading,
  filters,
  setPage,
}: FilterBarProps) => {
  const [isTyping, setIsTyping] = useState(false)
  const [rawQueryValue, setRawQueryValue] = useState('')
  const [filterKey, setFilterKey] = useState(filters.filterKey ?? 'owner')

  const setFiltersAndResetPage = (newFilter: any) => {
    setFilters({
      ...filters,
      filterKey,
      ...newFilter,
    })
    setPage(1)
  }

  const [_isReady] = useDebounce(
    async () => {
      const ensToAddress = await getAddressForName(rawQueryValue)
      const search = ensToAddress || rawQueryValue
      setFiltersAndResetPage({
        query: search,
      })
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

  const [openSearch, setOpenSearch] = useState(false)
  const [expandExpirationFilter, setExpandExpirationFilter] = useState(false)
  const [expandApprovalFilter, setExpandApprovalFilter] = useState(
    filters.approval !== ApprovalStatus.MINTED
  )

  const filterOptions = FILTER_ITEMS.filter((filter: Filter) => {
    if (typeof filter.show !== 'function') {
      return true
    }
    return filter.show(filters)
  }).map(({ key: value, label }: Filter) => ({
    value,
    label,
  }))

  const placeholder = FILTER_ITEMS.find(
    (filter) => filter.key === filterKey
  )?.placeholder

  const lockOptions = locks
    ? Object.keys(locks).map((address) => {
        return {
          label: locks[address].name || addressMinify(address),
          value: address,
        }
      })
    : []
  return (
    <div className="px-2 py-4 flex flex-col bg-ui-secondary-400 gap-4 md:gap-6 flex-wrap md:flex-row">
      {lockOptions.length > 1 && (
        <div className="flex flex-row gap-2 items-start md:items-center md:h-6">
          <div className="flex justify-start gap-1 items-center text-black font-medium text-sm p-0 w-24 md:w-fit">
            <FaFileContract size={18} />
            <span>Contract</span>
          </div>
          <div className="md:mt-2">
            <Select
              size="small"
              defaultValue={lockAddress}
              onChange={(newValue) => {
                setLockAddress && setLockAddress(newValue.toString())
              }}
              options={lockOptions}
            />
          </div>
        </div>
      )}

      {!hideExpirationFilter && (
        <div className="flex flex-row gap-2 items-start md:items-center md:h-6">
          <Button
            className="justify-start"
            variant="borderless"
            size="small"
            onClick={() => setExpandExpirationFilter(!expandExpirationFilter)}
          >
            <div className="w-24 md:w-fit  flex items-center gap-1">
              <FilterIcon size={18} />
              <span>Expiration</span>
            </div>
          </Button>
          {expandExpirationFilter && (
            <AttributeFilter
              values={ExpirationStatus}
              currentValue={filters.expiration}
              onChange={(expiration: string) => {
                setFiltersAndResetPage({
                  expiration: expiration as ExpirationStatus,
                })
              }}
            />
          )}
        </div>
      )}

      {!hideApprovalFilter && (
        <div className="flex flex-row gap-2 items-start md:items-center md:h-6">
          <Button
            className="justify-start"
            variant="borderless"
            size="small"
            onClick={() => setExpandApprovalFilter(!expandApprovalFilter)}
          >
            <div className="w-24 md:w-fit  flex items-center gap-1">
              <FilterIcon size={18} />
              <span>Approval {expandApprovalFilter ? ':' : ''}</span>
            </div>
          </Button>
          {expandApprovalFilter && (
            <AttributeFilter
              values={ApprovalStatus}
              currentValue={filters.approval}
              onChange={(approval: string) => {
                setFiltersAndResetPage({
                  approval: approval as ApprovalStatus,
                })
              }}
            />
          )}
        </div>
      )}
      <div className="flex flex-row gap-2 items-start md:items-center md:h-6">
        <Button
          className="justify-start"
          size="small"
          variant="borderless"
          onClick={() => setOpenSearch(!openSearch)}
        >
          <div className="w-24 md:w-fit flex items-center gap-1">
            <SearchIcon size={18} />
            <span>Search</span>
          </div>
        </Button>
        {openSearch && (
          <div className="flex flex-col gap-2 md:flex-row w-full md:mt-2">
            <Select
              size="small"
              options={filterOptions}
              defaultValue={filterKey}
              onChange={(filter: any) => {
                setFilterKey(filter)
                setRawQueryValue('')
              }}
            />
            <Input
              placeholder={placeholder}
              size="small"
              onChange={(e: any) => {
                setIsTyping(true)
                setRawQueryValue(e?.target?.value)
              }}
              value={rawQueryValue}
            />
          </div>
        )}
      </div>
    </div>
  )
}
