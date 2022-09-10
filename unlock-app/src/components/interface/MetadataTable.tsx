import React, { useState } from 'react'
import FileSaver from 'file-saver'
import Link from 'next/link'
import { buildCSV } from '../../utils/csv'
import {
  MemberCard,
  MemberCardPlaceholder,
} from '../interface/members/MemberCard'
import { Button } from '@unlock-protocol/ui'

export interface KeyMetadata {
  // These 3 properties are always present -- they come down from the graph as
  // strings
  lockName: string
  expiration: string
  keyholderAddress: string
  // Can have any other arbitrary properies, as long as the values are strings.
  [key: string]: string
}

interface MetadataTableProps {
  // The keys to the metadata object, in the order they will be displayed.
  columns: string[]
  metadata: KeyMetadata[]
  allMetadata: KeyMetadata[]
  loading?: boolean
  hasSearchValue?: boolean
  lockManagerMapping?: {
    [lockAddress: string]: boolean
  }
  lockAddresses?: string[]
  membersCount?: MemberCountProps['membersCount']
  hasExpiredKeys?: boolean
}

/**
 * Downloads a file with the key metadata as CSV
 * Includes the colum name in the first row
 */
function downloadAsCSV(columns: any, metadata: any) {
  const csv = buildCSV(columns, metadata)

  const blob = new Blob([csv], {
    type: 'data:text/csv;charset=utf-8',
  })
  FileSaver.saveAs(blob, 'members.csv')
}

interface MemberCountProps {
  membersCount?: {
    active: number
    total: number
  }
}

const TotalMemberCount = ({ membersCount }: MemberCountProps) => {
  const { active = 0, total = 0 } = membersCount ?? {}

  const showTotal = total > 0

  // if there is a missmatch beetween total and active, we have some expired keys
  const showActiveTotalRatio = active !== total

  if (active === 0 && total === 0) return null

  return (
    <div className="flex divide-x-2">
      {showTotal && (
        <div className="px-1 text-lg font-semibold">Total members: {total}</div>
      )}
      {showActiveTotalRatio && (
        <div className="px-1 text-lg font-semibold">
          Active members: {active}/{total}
        </div>
      )}
    </div>
  )
}

export const MetadataTable: React.FC<MetadataTableProps> = ({
  columns,
  metadata = [],
  allMetadata = [],
  membersCount,
  loading = false,
  lockManagerMapping,
  hasSearchValue = false,
}) => {
  const hasLockManagerStatus = Object.values(lockManagerMapping ?? {}).some(
    (status) => status
  )
  const [expandAllMetadata, setExpandAllMetadata] = useState(false)

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <MemberCardPlaceholder />
        <MemberCardPlaceholder />
        <MemberCardPlaceholder />
        <MemberCardPlaceholder />
        <MemberCardPlaceholder />
      </div>
    )
  }

  if (metadata?.length === 0) {
    return hasSearchValue ? (
      <span className="text-gray-600">No key matches your filter.</span>
    ) : (
      <span className="text-gray-600">
        No keys have been purchased yet. Return to your{' '}
        <Link href="/dashboard">
          <a>Dashboard</a>
        </Link>
        .
      </span>
    )
  }

  const onExpandAllMetadata = () => {
    if (!hasLockManagerStatus) return
    setExpandAllMetadata(!expandAllMetadata)
  }

  const showCheckInTimeInfo = metadata?.some((item) => item?.checkedInAt)
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-[1rem]">
        <TotalMemberCount membersCount={membersCount} />
        <div className="flex ml-auto gap-[1rem]">
          <Button
            className="flex-initial"
            size="small"
            onClick={() => {
              downloadAsCSV(columns, allMetadata)
            }}
          >
            Export all members
          </Button>
          {hasLockManagerStatus && (
            <div className="flex justify-end">
              <Button size="small" onClick={onExpandAllMetadata}>
                Show all metadata
              </Button>
            </div>
          )}
        </div>
      </div>

      {metadata?.map((data: any) => {
        const { lockName, expiration, keyholderAddress, token, lockAddress } =
          data
        const key = `${lockName}${expiration}${keyholderAddress}`
        const isLockManager =
          lockManagerMapping?.[lockAddress.toLowerCase()] ?? false

        return (
          <MemberCard
            key={key}
            lockAddress={lockAddress}
            lockName={lockName}
            expiration={expiration}
            tokenId={token}
            keyholderAddress={keyholderAddress}
            metadata={data}
            expandAllMetadata={expandAllMetadata}
            isLockManager={isLockManager}
            showCheckInTimeInfo={showCheckInTimeInfo}
          />
        )
      })}

      <div className="flex justify-end">
        <Button
          className="flex-initial"
          size="small"
          onClick={() => {
            downloadAsCSV(columns, metadata)
          }}
        >
          Export current members
        </Button>
      </div>
    </section>
  )
}

MetadataTable.defaultProps = {
  hasSearchValue: false,
  lockManagerMapping: {},
  lockAddresses: [],
  hasExpiredKeys: false,
}

export default MetadataTable
