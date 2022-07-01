import React, { useState } from 'react'
import FileSaver from 'file-saver'
import Link from 'next/link'
import { buildCSV } from '../../utils/csv'
import { MemberFilters } from '../../unlockTypes'
import { ExpireAndRefundModal } from './ExpireAndRefundModal'
import { MemberCard } from '../interface/members/MemberCard'
import { Button } from '@unlock-protocol/ui'
interface KeyMetadata {
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
  filter?: string
  isLockManager?: boolean
  lockAddresses?: string[]
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

export const MetadataTable: React.FC<MetadataTableProps> = ({
  columns,
  metadata,
  filter,
  isLockManager,
  lockAddresses = [],
}) => {
  const [currentLock, setCurrentLock] = useState(null)
  const [expandAllMetadata, setExpandAllMetadata] = useState(false)
  const [showExpireAndRefundModal, setShowExpireAndRefundModal] =
    useState(false)

  if (metadata.length === 0) {
    if (filter === MemberFilters.ALL) {
      return (
        <span className="text-gray-600">
          No keys have been purchased yet. Return to your{' '}
          <Link href="/dashboard">
            <a>Dashboard</a>
          </Link>
          .
        </span>
      )
    }

    return <p>No keys found matching the current filter.</p>
  }

  const onExpireAndRefund = (lock: any) => {
    if (expireAndRefundDisabled(lock)) return
    setShowExpireAndRefundModal(true)
    setCurrentLock(lock)
  }

  const closeExpireAndRefund = () => {
    setShowExpireAndRefundModal(false)
    setCurrentLock(null)
  }

  const isKeyValid = (metadata: any) => {
    if (!metadata?.expiration) return false
    const now = new Date().getTime()
    const expiration = new Date(metadata?.expiration).getTime()
    return expiration > now
  }

  const expireAndRefundDisabled = (metadata: unknown): boolean => {
    return !(isLockManager && isKeyValid(metadata))
  }

  const onExpandAllMetadata = () => {
    if (!isLockManager) return
    setExpandAllMetadata(!expandAllMetadata)
  }

  const showCheckInTimeInfo = metadata?.some((item) => item?.checkedInAt)

  return (
    <section className="flex flex-col gap-3">
      <ExpireAndRefundModal
        active={showExpireAndRefundModal}
        dismiss={closeExpireAndRefund}
        lock={currentLock}
        lockAddresses={lockAddresses}
      />

      {isLockManager && (
        <div className="flex justify-end">
          <Button onClick={onExpandAllMetadata}>Show all metadata</Button>
        </div>
      )}
      {metadata?.map((data: any) => {
        const { lockName, expiration, keyholderAddress, token } = data
        const key = `${lockName}${expiration}${keyholderAddress}`

        return (
          <MemberCard
            key={key}
            lockName={lockName}
            expiration={expiration}
            tokenId={token}
            keyholderAddress={keyholderAddress}
            metadata={data}
            expandAllMetadata={expandAllMetadata}
            isLockManager={isLockManager}
            expireAndRefundDisabled={expireAndRefundDisabled(data)}
            onExpireAndRefund={() => onExpireAndRefund(data)}
            showCheckInTimeInfo={showCheckInTimeInfo}
          />
        )
      })}

      <div className="flex justify-end">
        <Button
          className="flex-initial"
          onClick={() => {
            downloadAsCSV(columns, metadata)
          }}
        >
          Export as CSV
        </Button>
      </div>
    </section>
  )
}

MetadataTable.defaultProps = {
  filter: '',
  isLockManager: false,
  lockAddresses: [],
}

export default MetadataTable
