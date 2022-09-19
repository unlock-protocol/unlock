import { Button, Collapse } from '@unlock-protocol/ui'
import { useState, useEffect } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { MAX_UINT } from '~/constants'
import { KeyMetadata } from '~/unlockTypes'
import { expirationAsDate } from '~/utils/durations'
import { MetadataCard } from './MetadataCard'
import useClipboard from 'react-use-clipboard'
import { BiCopy as CopyIcon } from 'react-icons/bi'
import { Address } from './Members'
import { ExpireAndRefundModal } from '~/components/interface/ExpireAndRefundModal'

interface MemberCardProps {
  token: string
  owner: string
  expiration: string
  version: number
  isLockManager: boolean
  metadata: any
  lockAddress: string
}

interface DetailProps {
  title: string
  value: React.ReactNode
}
const CardDetail = ({ title, value }: DetailProps) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-base text-gray-700">{title}</span>
      {value && <span className="text-lg font-bold text-black">{value}</span>}
    </div>
  )
}

export const MemberCard = ({
  token,
  owner,
  expiration,
  version,
  isLockManager,
  metadata,
  lockAddress,
}: MemberCardProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showExpireAndRefundModal, setShowExpireAndRefundModal] =
    useState(false)
  const [isCopied, setCopied] = useClipboard(owner, {
    successDuration: 2000,
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

  const canExtendKey = expiration !== MAX_UINT && version && version >= 11
  const refundDisabled = !(isLockManager && isKeyValid(expiration))

  const { token: tokenId } = metadata ?? {}

  const MemberInfo = () => {
    return (
      <>
        <ExpireAndRefundModal
          active={showExpireAndRefundModal}
          dismiss={() => setShowExpireAndRefundModal(false)}
          lockAddress={lockAddress}
          keyOwner={owner}
          tokenId={tokenId}
        />
        <div className="justify-between md:grid md:grid-cols-7">
          <div className="md:col-span-1">
            <CardDetail title="Token ID" value={token} />
          </div>
          <div className="flex gap-2 md:col-span-2">
            <CardDetail title="Owner" value={<Address address={owner} />} />
            <div className="pb-1 mt-auto">
              <Button
                variant="transparent"
                className="p-0 m-0 "
                onClick={setCopied}
              >
                <CopyIcon size={20} />
              </Button>
            </div>
          </div>
          <div className="md:col-span-2">
            <CardDetail
              title="Expiration"
              value={expirationAsDate(expiration)}
            />
          </div>

          {isLockManager && (
            <div className="ml-auto md:col-span-2">
              <div className="flex gap-3">
                {!refundDisabled && (
                  <Button
                    size="small"
                    variant="outlined-primary"
                    disabled={refundDisabled}
                    onClick={() => {
                      if (refundDisabled) return
                      setShowExpireAndRefundModal(true)
                    }}
                  >
                    Refund
                  </Button>
                )}
                {canExtendKey && (
                  <Button variant="outlined-primary" size="small">
                    Extend
                  </Button>
                )}
              </div>
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
      disabled={!isLockManager}
      content={<MemberInfo />}
    >
      <MetadataCard metadata={metadata} owner={owner} />
    </Collapse>
  )
}
