import { Button, Collapse } from '@unlock-protocol/ui'
import React, { useState, useEffect } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { MAX_UINT } from '~/constants'
import { KeyMetadata } from '~/unlockTypes'
import { expirationAsDate } from '~/utils/durations'
import { MetadataCard } from './MetadataCard'
import useClipboard from 'react-use-clipboard'
import { BiCopy as CopyIcon } from 'react-icons/bi'
import { ExpireAndRefundModal } from '~/components/interface/ExpireAndRefundModal'
import ExtendKeysDrawer from '~/components/creator/members/ExtendKeysDrawer'
import { useLockManager } from '~/hooks/useLockManager'
import useEns from '~/hooks/useEns'
import { addressMinify } from '~/utils/strings'
import { Detail } from '@unlock-protocol/ui'

interface MemberCardProps {
  token: string
  owner: string
  expiration: string
  version: number
  metadata: any
  lockAddress: string
  network: number
  expirationDuration: string
  lockSettings?: Record<string, any>
}

export const MemberCard = ({
  token,
  owner,
  expiration,
  version,
  metadata,
  lockAddress,
  network,
  expirationDuration,
  lockSettings,
}: MemberCardProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [expireAndRefundOpen, setExpireAndRefundOpen] = useState(false)
  const [extendKeysOpen, setExtendKeysOpen] = useState(false)

  const addressToEns = useEns(owner)

  const resolvedAddress =
    addressToEns === owner ? addressMinify(owner) : addressToEns

  const addressToCopy = addressToEns === owner ? owner : addressToEns
  const [isCopied, setCopied] = useClipboard(addressToCopy, {
    successDuration: 2000,
  })

  const { isManager } = useLockManager({
    lockAddress,
    network,
  })

  useEffect(() => {
    if (!isCopied) return
    ToastHelper.success('Address copied')
  }, [isCopied])

  const isKeyValid = (timestamp: KeyMetadata['expiration']) => {
    const now = new Date().getTime() / 1000
    if (timestamp === MAX_UINT) return true
    return parseInt(timestamp) > now
  }

  const canExtendKey =
    expiration !== MAX_UINT && version !== undefined && version >= 11
  const refundDisabled = !(isManager && isKeyValid(expiration))

  const { token: tokenId, lockName } = metadata ?? {}

  const MemberInfo = () => {
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
        <div className="grid justify-between grid-cols-3 gap-4 md:grid-cols-7 md:gap-0">
          <Detail
            className="col-span-3 md:col-span-1 grow"
            label="Token ID"
            valueSize="medium"
          >
            {token}
          </Detail>
          <Detail
            className="col-span-3 md:col-span-2"
            label="Owner"
            valueSize="medium"
          >
            <div className="flex self-start gap-2">
              <div>{resolvedAddress}</div>
              <div className="mt-auto">
                <Button
                  variant="borderless"
                  onClick={setCopied}
                  aria-label="copy"
                >
                  <CopyIcon size={20} />
                </Button>
              </div>
            </div>
          </Detail>
          <Detail
            className="col-span-3 md:col-span-2"
            label="Expiration"
            valueSize="medium"
          >
            {expirationAsDate(expiration)}
          </Detail>

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
      content={<MemberInfo />}
    >
      <MetadataCard
        expirationDuration={expirationDuration}
        metadata={metadata}
        owner={owner}
        network={network}
        lockSettings={lockSettings}
      />
    </Collapse>
  )
}
