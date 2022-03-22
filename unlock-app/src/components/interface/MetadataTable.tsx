import React, { useState } from 'react'
import FileSaver from 'file-saver'
import Link from 'next/link'
import { camelCaseToTitle } from '../../utils/strings'
import { buildCSV } from '../../utils/csv'
import Address from './Address'
import { MemberFilters } from '../../unlockTypes'
import { InlineModal } from './InlineModal'
import { ExpireAndRefund } from './ExpireAndRefund'
import styles from './MetadataTable.module.scss'

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
  isLockManager: boolean
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

interface CellProps {
  kind: string
  value: string
}

export const Cell = ({ kind, value }: CellProps) => {
  return kind === 'keyholderAddress' ? (
    <Address address={value} />
  ) : (
    <>{value}</>
  )
}

export const MetadataTable: React.FC<MetadataTableProps> = ({
  columns,
  metadata,
  filter,
  isLockManager,
}) => {
  if (metadata.length === 0) {
    if (filter === MemberFilters.ALL) {
      return (
        <p>
          No keys have been purchased yet. Return to your{' '}
          <Link href="/dashboard">
            <a>Dashboard</a>
          </Link>
          .
        </p>
      )
    }

    return <p>No keys found matching the current filter.</p>
  }

  const [showExpireAndRefundModal, setShowExpireAndRefundModal] =
    useState(false)

  const onExpireAndRefund = () => {
    setShowExpireAndRefundModal(true)
  }

  const closeExpireAndRefund = () => {
    setShowExpireAndRefundModal(false)
  }
  return (
    <section className={styles.metadataTableSection}>
      <InlineModal
        active={showExpireAndRefundModal}
        dismiss={closeExpireAndRefund}
      >
        <ExpireAndRefund />
      </InlineModal>
      <table>
        <thead>
          <tr>
            {columns.map((col) => {
              return <th key={col}>{camelCaseToTitle(col)}</th>
            })}
            {isLockManager && <th key="actions">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {metadata.map((datum) => {
            const { lockName, expiration, keyholderAddress } = datum
            const key = `${lockName}${expiration}${keyholderAddress}`
            return (
              <tr key={key}>
                {columns.map((col) => {
                  return (
                    <td key={col}>
                      <Cell kind={col} value={datum[col]} />
                    </td>
                  )
                })}
                {isLockManager && (
                  <td>
                    <button
                      className={styles.button}
                      type="button"
                      disabled={!isLockManager}
                      onClick={onExpireAndRefund}
                    >
                      Expire and Refund
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
      <button
        type="button"
        disabled
        className={styles.downloadButton}
        onClick={() => {
          downloadAsCSV(columns, metadata)
        }}
      >
        Export as CSV
      </button>
    </section>
  )
}

MetadataTable.defaultProps = {
  filter: '',
}

export default MetadataTable
