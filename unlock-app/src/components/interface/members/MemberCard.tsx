import React, { useState } from 'react'
import { Button } from '@unlock-protocol/ui'

const styles = {
  title: 'text-lg font-bold text-black',
  description: 'text-xs	font-sm font-normal',
  address: 'text-sm	font-sm font-normal text-gray-600',
}
interface MemberCardProps {
  lockName: string
  expiration: string
  keyholderAddress: string
  tokenId: string
  onExpireAndRefund: (lock: any) => void
  isLockManager?: boolean
  expireAndRefundDisabled?: boolean
  metadata?: object
}

const keysToIgnore = ['token', 'lockName', 'keyholderAddress', 'expiration']

export const MemberCard: React.FC<MemberCardProps> = ({
  lockName,
  expiration,
  keyholderAddress,
  tokenId,
  onExpireAndRefund,
  expireAndRefundDisabled = true,
  metadata = {},
}) => {
  const [showMetaData, setShowMetaData] = useState(false)
  const addressMinify = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`
  }

  const extraDataItems: [string, string][] = Object.entries(
    metadata || {}
  ).filter(([key]) => {
    return !keysToIgnore.includes(key)
  })

  const toggleMetada = () => {
    setShowMetaData(!showMetaData)
  }

  const hasExtraData = extraDataItems?.length > 0

  return (
    <div className=" border-2 rounded-lg py-4 px-10 hover:shadow-sm">
      <div className="flex justify-between">
        <div className="flex flex-col">
          <span className={styles.description}>Lock name</span>
          <span className={styles.title}>{lockName}</span>
        </div>
        <div className="flex flex-col">
          <span className={styles.description}>Owner</span>
          <span className={styles.title}>
            {addressMinify(keyholderAddress)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className={styles.description}>Token ID</span>
          <span className={styles.title}>{tokenId}</span>
        </div>
        <div className="flex flex-col">
          <span className={styles.description}>Expiration</span>
          <span className={styles.title}>{expiration}</span>
        </div>
        <div className="flex flex-col">
          <span className={styles.description}>Checked in At</span>
          <span className={styles.title}>-</span>
        </div>
        <div className="flex gap-2 items-center">
          <Button
            size="small"
            variant="outlined-primary"
            disabled={expireAndRefundDisabled}
            onClick={onExpireAndRefund}
          >
            Expire and Refund
          </Button>
          <Button
            size="small"
            variant="outlined-primary"
            onClick={toggleMetada}
          >
            Show metadata
          </Button>
        </div>
      </div>
      <div>
        {showMetaData && (
          <div>
            <span className={styles.description}>Metadata</span>
            {!hasExtraData && (
              <span className="block">There is no metadata</span>
            )}
            {hasExtraData &&
              hasExtraData &&
              extraDataItems?.map(([key, value], index) => {
                return (
                  <div key={index}>
                    <strong>{key}</strong>: <span>{value}</span>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
