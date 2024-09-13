import { Button, Collapse, Detail } from '@unlock-protocol/ui'
import React, { useState } from 'react'
import { MAX_UINT } from '~/constants'
import { KeyMetadata } from '~/unlockTypes'
import { expirationAsDate } from '~/utils/durations'
import { MetadataCard as MetadataCardDefault } from './MetadataCard'
import { ExpireAndRefundModal } from '~/components/interface/ExpireAndRefundModal'
import ExtendKeysDrawer from '~/components/creator/members/ExtendKeysDrawer'
import { useLockManager } from '~/hooks/useLockManager'
import { WrappedAddress } from '~/components/interface/WrappedAddress'

export interface MemberCardProps {
  token: string
  owner: string
  expiration: string
  version: number
  metadata: any
  lockAddress: string
  network: number
  expirationDuration: string
  lockSettings?: Record<string, any>
  showExpiration?: boolean
  MemberInfo?: React.FC
  MetadataCard?: any
  isSelected?: boolean
  setIsSelected?: (selected: boolean) => void
}

export const MemberCard = ({
  owner,
  expiration,
  version,
  metadata,
  lockAddress,
  network,
  expirationDuration,
  lockSettings,
  showExpiration = true,
  MemberInfo,
  MetadataCard,
}: MemberCardProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [expireAndRefundOpen, setExpireAndRefundOpen] = useState(false)
  const [extendKeysOpen, setExtendKeysOpen] = useState(false)

  const { isManager } = useLockManager({
    lockAddress,
    network,
  })

  const isKeyValid = (timestamp: KeyMetadata['expiration']) => {
    const now = new Date().getTime() / 1000
    if (timestamp === MAX_UINT) return true
    return parseInt(timestamp) > now
  }

  const canExtendKey =
    expiration !== MAX_UINT && version !== undefined && version >= 11
  const refundDisabled = !(isManager && isKeyValid(expiration))

  const { token: tokenId, lockName } = metadata ?? {}

  // boolean to check if the membership/key is expired
  const isExpired = expirationAsDate(expiration) === 'Expired'

  const MemberInfoDefault = () => {
    return (
      <>
        <ExpireAndRefundModal
          network={network}
          isOpen={expireAndRefundOpen}
          setIsOpen={setExpireAndRefundOpen}
          lockAddress={lockAddress}
          keyOwner={owner}
          tokenId={tokenId}
        />

        <ExtendKeysDrawer
          isOpen={extendKeysOpen}
          setIsOpen={setExtendKeysOpen}
          selectedKey={
            {
              lockName,
              owner,
              lockAddress,
              tokenId,
              expiration,
              network,
            }!
          }
        />

        <div className="flex md:flex-row flex-col gap-4 w-full">
          <Detail label="#" valueSize="medium" className="w-8">
            {tokenId}
          </Detail>

          <Detail label="Owner" valueSize="medium" className="grow md:w-1/4">
            <WrappedAddress
              address={owner}
              showCopyIcon={true}
              showExternalLink={false}
            />
          </Detail>

          {showExpiration && (
            <Detail label="Expiration" valueSize="medium" className="grow">
              {expirationAsDate(expiration)}
            </Detail>
          )}

          {isManager && (
            <div className="w-full col-span-3 gap-3 mx-auto md:mx-0 md:ml-auto md:col-span-2 md:w-auto">
              {!refundDisabled && (
                <Button
                  size="small"
                  variant="outlined-primary"
                  disabled={refundDisabled}
                  aria-label="refund"
                  onClick={() => {
                    if (refundDisabled) return
                    setExpireAndRefundOpen(true)
                  }}
                >
                  Cancel
                </Button>
              )}
              {canExtendKey && (
                <Button
                  variant="outlined-primary"
                  size="small"
                  onClick={() => setExtendKeysOpen(true)}
                  className="mt-1"
                >
                  Extend
                </Button>
              )}
            </div>
          )}
        </div>
      </>
    )
  }

  return (
    <Collapse
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      disabled={!isManager}
      content={MemberInfo ? <MemberInfo /> : <MemberInfoDefault />}
    >
      {MetadataCard ? (
        MetadataCard
      ) : (
        <MetadataCardDefault
          expirationDuration={expirationDuration}
          metadata={metadata}
          owner={owner}
          network={network}
          lockSettings={lockSettings}
          isExpired={isExpired}
        />
      )}
    </Collapse>
  )
}
