import React, { useState, useEffect, useContext } from 'react'
import { Button, Tooltip } from '@unlock-protocol/ui'
import { addressMinify } from '../../../utils/strings'
import { RiArrowDropDownLine as ArrowDown } from 'react-icons/ri'
import { useStorageService } from '../../../utils/withStorageService'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'
import { WalletServiceContext } from '../../../utils/withWalletService'
import { ToastHelper } from '~/components/helpers/toast.helper'

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
  isLockManager?: boolean
  expireAndRefundDisabled?: boolean
  metadata?: { [key: string]: any }
}

const keysToIgnore = [
  'token',
  'lockName',
  'keyholderAddress',
  'expiration',
  'lockAddress',
]

export const MemberCard: React.FC<MemberCardProps> = ({
  lockName,
  expiration,
  keyholderAddress,
  tokenId,
  onExpireAndRefund,
  expandAllMetadata,
  expireAndRefundDisabled = true,
  metadata = {},
}) => {
  const { network, account } = useContext(AuthenticationContext)
  const walletService = useContext(WalletServiceContext)
  const [showMetaData, setShowMetaData] = useState(expandAllMetadata)
  const storageService = useStorageService()
  const extraDataItems: [string, string][] = Object.entries(
    metadata || {}
  ).filter(([key]) => {
    return !keysToIgnore.includes(key)
  })

  const toggleMetada = () => {
    setShowMetaData(!showMetaData)
  }

  useEffect(() => {
    setShowMetaData(expandAllMetadata)
  }, [expandAllMetadata])

  const hasExtraData = extraDataItems?.length > 0

  const onSendQrCode = async () => {
    if (!network) return
    await storageService.loginPrompt({
      walletService,
      address: account!,
      chainId: network,
    })
    const res = await storageService.sendKeyQrCodeViaEmail({
      lockAddress: metadata.lockAddress,
      network,
      tokenId,
    })

    if (res.message) {
      ToastHelper.error(res.message)
    } else {
      ToastHelper.success('QR-code sent by email')
    }
  }

  const hasEmailMetadata = extraDataItems.map(([key]) => key).includes('email')

  return (
    <div
      data-testid="member-card"
      className="border-2 rounded-lg py-4 px-10 hover:shadow-sm bg-white"
    >
      <div className="grid grid-cols-6 gap-2 justify-between">
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
            {!hasExtraData && (
              <span className="block">There is no metadata</span>
            )}
            {hasExtraData && hasExtraData && (
              <div className="flex flex-col">
                {hasEmailMetadata && (
                  <Button
                    size="tiny"
                    variant="primary"
                    className="my-3 ml-auto"
                    onClick={onSendQrCode}
                  >
                    Send QR-code by email
                  </Button>
                )}
                <span className={styles.description}>Metadata</span>
                {extraDataItems?.map(([key, value], index) => {
                  return (
                    <div key={index}>
                      <strong>{key}</strong>: <span>{value}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
