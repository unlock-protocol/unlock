import { Button, Collapse, Detail } from '@unlock-protocol/ui'
import React, { useState } from 'react'
import { MAX_UINT } from '~/constants'
import { KeyMetadata } from '~/unlockTypes'
import { expirationAsDate } from '~/utils/durations'
import { MetadataCard as MetadataCardDefault } from './MetadataCard'
import { ExpireAndRefundModal } from '~/components/interface/ExpireAndRefundModal'
import ExtendKeysDrawer from '~/components/creator/members/ExtendKeysDrawer'
import { WrappedAddress } from '~/components/interface/WrappedAddress'

export interface MemberCardProps {
  // Core member data
  token: string
  owner: string
  expiration: string
  version: number
  metadata: any

  // Lock information
  lockAddress: string
  network: number
  expirationDuration: string
  lockSettings?: Record<string, any>

  // customization options
  showExpiration?: boolean
  MemberInfo?: React.FC
  MetadataCard?: React.ReactNode

  // Selection options (for bulk operations)
  isSelected?: boolean
  setIsSelected?: (selected: boolean) => void

  // Display options
  resolvedName?: string
  isManager?: boolean
}

/**
 * Component for displaying a single member/key with expandable details
 */
export const MemberCard = ({
  // Member data
  owner,
  expiration,
  version,
  metadata,

  // Lock info
  lockAddress,
  network,
  expirationDuration,
  lockSettings,

  // UI options
  showExpiration = true,
  MemberInfo,
  MetadataCard,

  // Display/permissions
  resolvedName,
  isManager,
}: MemberCardProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [expireAndRefundOpen, setExpireAndRefundOpen] = useState(false)
  const [extendKeysOpen, setExtendKeysOpen] = useState(false)

  const isKeyValid = (timestamp: KeyMetadata['expiration']) => {
    const now = new Date().getTime() / 1000
    if (timestamp === MAX_UINT) return true
    return parseInt(timestamp) > now
  }

  // Feature flags based on key status and lock version
  const canExtendKey =
    expiration !== MAX_UINT && version !== undefined && version >= 11
  const refundDisabled = !(isManager && isKeyValid(expiration))

  // Extract metadata fields
  const { token: tokenId, lockName } = metadata ?? {}

  // Check if the membership/key is expired
  const isExpired = expirationAsDate(expiration) === 'Expired'

  /**
   * Default member info display if none is provided
   */
  const MemberInfoDefault = () => {
    return (
      <>
        {/* Modals */}
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

        {/* Member details layout */}
        <div className="flex md:flex-row flex-col gap-4 w-full">
          <Detail label="#" valueSize="medium" className="w-8">
            {tokenId}
          </Detail>

          <Detail label="Owner" valueSize="medium" className="grow md:w-1/4">
            <WrappedAddress
              address={owner}
              showCopyIcon={true}
              showExternalLink={false}
              resolvedName={resolvedName || ''}
              skipResolution={true}
              showResolvedName={!!resolvedName}
            />
          </Detail>

          {showExpiration && (
            <Detail label="Expiration" valueSize="medium" className="grow">
              {expirationAsDate(expiration)}
            </Detail>
          )}

          {/* Manager actions - only shown to lock managers */}
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
      disabled={isManager === false}
      content={MemberInfo ? <MemberInfo /> : <MemberInfoDefault />}
    >
      {/* Render provided MetadataCard or use default */}
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
