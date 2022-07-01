import React, { useState, useEffect, useContext } from 'react'
import { Badge, Button } from '@unlock-protocol/ui'
import { addressMinify } from '../../../utils/strings'
import { RiArrowDropDownLine as ArrowDown } from 'react-icons/ri'
import { FaCheckCircle as CheckIcon } from 'react-icons/fa'
import { StorageServiceContext } from '../../../utils/withStorageService'
import { ToastHelper } from '../../../components/helpers/toast.helper'
import AuthenticationContext from '../../../contexts/AuthenticationContext'

const styles = {
  title: 'text-base font-medium text-black break-all	',
  description: 'text-sm font-normal text-gray-500',
  address: 'text-sm	font-sm font-normal text-gray-600',
}
interface MemberCardProps {
  lockName: string
  expiration: string
  keyholderAddress: string
  tokenId: string
  onExpireAndRefund: (lock: any) => void
  expandAllMetadata: boolean
  showCheckInTimeInfo: boolean
  isLockManager?: boolean
  expireAndRefundDisabled?: boolean
  metadata?: { [key: string]: any }
}

const keysToIgnore = [
  'token',
  'lockName',
  'keyholderAddress',
  'expiration',
  'checkedInAt',
  'lockAddress',
]

export const MemberCardPlaceholder: React.FC<any> = () => {
  return (
    <div className="h-[130px] md:h-[90px] border-2 rounded-lg bg-slate-200 animate-pulse"></div>
  )
}

export const MemberCard: React.FC<MemberCardProps> = ({
  lockName,
  expiration,
  keyholderAddress,
  tokenId,
  onExpireAndRefund,
  expandAllMetadata,
  showCheckInTimeInfo,
  expireAndRefundDisabled = true,
  metadata = {},
}) => {
  const storageService = useContext(StorageServiceContext)
  const { network } = useContext(AuthenticationContext)
  const [showMetaData, setShowMetaData] = useState(expandAllMetadata)

  const extraDataItems: [string, string | number][] = Object.entries(
    metadata || {}
  ).filter(([key]) => {
    return !keysToIgnore.includes(key)
  })

  const getCheckInTime = () => {
    const [_, checkInTimeValue] =
      extraDataItems?.find(([key]) => key === 'checkedInAt') ?? []
    if (!checkInTimeValue) return null
    return new Date(checkInTimeValue as number).toLocaleString()
  }
  const toggleMetada = () => {
    setShowMetaData(!showMetaData)
  }

  const isCheckedIn = typeof getCheckInTime() === 'string'

  useEffect(() => {
    setShowMetaData(expandAllMetadata)
  }, [expandAllMetadata])

  const hasExtraData = extraDataItems?.length > 0

  const onMarkAsCheckIn = async () => {
    try {
      if (!storageService) return
      const { lockAddress, token: keyId } = metadata
      const markTicketCheckInPromise = storageService.markTicketAsCheckedIn({
        lockAddress,
        keyId,
        network: network!,
      })

      await ToastHelper.promise(markTicketCheckInPromise, {
        loading: `Marking ticket as Check-in`,
        error: `Error on marking ticket as checked-in`,
        success: `Successfully marked ticket as checked-in`,
      })
    } catch (err) {
      ToastHelper.error('Error on marking ticket as checked-in')
    }
  }

  return (
    <div
      data-testid="member-card"
      className="border-2 rounded-lg py-4 px-10 hover:shadow-sm bg-white"
    >
      <div className="grid gap-2 justify-between grid-cols-6 mb-2">
        <div className="col-span-full	flex flex-col md:col-span-1">
          <span className={styles.description}>Lock name</span>
          <span className={styles.title}>{lockName}</span>
        </div>
        <div className="col-span-full	flex flex-col md:col-span-1">
          <span className={styles.description}>Owner</span>
          <span className={styles.title}>
            {addressMinify(keyholderAddress)}
          </span>
        </div>
        <div className="col-span-full	flex flex-col md:col-span-1">
          <span className={styles.description}>Token ID</span>
          <span className={styles.title}>{tokenId}</span>
        </div>
        <div className="col-span-full	flex flex-col md:col-span-1">
          <span className={styles.description}>Expiration</span>
          <span className={styles.title}>{expiration}</span>
        </div>
        <div className="col-span-full flex gap-2 justify-start lg:col-span-2 lg:justify-end">
          <Button
            size="small"
            variant="outlined-primary"
            className="disabled:border-opacity-50 disabled:border-gray-200 disabled:text-opacity-50 hover:disabled:text-opacity-50"
            disabled={expireAndRefundDisabled}
            onClick={onExpireAndRefund}
          >
            Expire & Refund
          </Button>
          <Button size="small" variant="secondary" onClick={toggleMetada}>
            <div className="flex items-center">
              <span>Show metadata</span>
              <ArrowDown />
            </div>
          </Button>
        </div>
      </div>
      <div>
        {showMetaData && (
          <div>
            <span className={styles.description}>Metadata</span>
            {!isCheckedIn && (
              <Button className="my-2" onClick={onMarkAsCheckIn} size="small">
                Mark as Checked-in
              </Button>
            )}
            {showCheckInTimeInfo && isCheckedIn && (
              <span className="block py-2">
                <Badge
                  size="tiny"
                  variant="green"
                  iconRight={<CheckIcon size={11} />}
                >
                  Checked-in
                </Badge>
              </span>
            )}
            {!hasExtraData && (
              <span className="block">There is no metadata</span>
            )}
            {(hasExtraData || isCheckedIn) && (
              <>
                {isCheckedIn && (
                  <div>
                    <strong>Checked-in At:</strong>{' '}
                    <span>{getCheckInTime()}</span>
                  </div>
                )}
                {extraDataItems?.map(([key, value], index) => {
                  return (
                    <div key={index}>
                      <strong>{key}</strong>: <span>{value}</span>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
