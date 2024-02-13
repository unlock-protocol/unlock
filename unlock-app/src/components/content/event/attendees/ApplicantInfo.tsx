import { Button, Detail } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import useEns from '~/hooks/useEns'
import { addressMinify } from '~/utils/strings'
import { BiCopy as CopyIcon } from 'react-icons/bi'
import useClipboard from 'react-use-clipboard'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { Metadata } from '@unlock-protocol/core'
import { ApproveAttendeeModalModal } from './ApproveAttendeeModal'
import { DenyAttendeeModalModal } from './DenyAttendeeModalModal'

interface ApplicantInfoProps {
  network: number
  lockAddress: string
  owner: string
  metadata: Metadata
}

export const ApplicantInfo = ({
  network,
  lockAddress,
  owner,
  metadata,
}: ApplicantInfoProps) => {
  const [approveAttendeeModalOpen, setApproveAttendeeModalOpen] =
    useState(false)
  const [denyAttendeeModalOpen, setDenyAttendeeModalOpen] = useState(false)
  const addressToEns = useEns(owner)
  const resolvedAddress =
    addressToEns === owner ? addressMinify(owner) : addressToEns
  const addressToCopy = addressToEns === owner ? owner : addressToEns

  const [isCopied, setCopied] = useClipboard(addressToCopy, {
    successDuration: 2000,
  })

  useEffect(() => {
    if (!isCopied) return
    ToastHelper.success('Address copied')
  }, [isCopied])

  return (
    <>
      <ApproveAttendeeModalModal
        network={network}
        isOpen={approveAttendeeModalOpen}
        setIsOpen={setApproveAttendeeModalOpen}
        lockAddress={lockAddress}
        keyOwner={owner}
        metadata={metadata}
      />
      <DenyAttendeeModalModal
        network={network}
        isOpen={denyAttendeeModalOpen}
        setIsOpen={setDenyAttendeeModalOpen}
        lockAddress={lockAddress}
        keyOwner={owner}
      />

      <div className="flex md:flex-row flex-col gap-4 space-between w-full">
        <Detail
          label="Full Name"
          valueSize="medium"
          className="w-full overflow-auto min-w-24"
        >
          {metadata.fullname}
        </Detail>

        <Detail
          label="Email"
          valueSize="medium"
          className="w-full overflow-auto min-w-24"
        >
          {metadata.email}
        </Detail>

        <Detail
          label="Wallet"
          valueSize="medium"
          className="w-full overflow-auto min-w-24"
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

        <div className="gap-1 flex flex-col w-auto">
          {metadata.approval !== 'approved' && (
            <Button
              size="small"
              onClick={() => setApproveAttendeeModalOpen(true)}
              className="w-full"
            >
              Approve
            </Button>
          )}
          {metadata.approval !== 'denied' && (
            <Button
              variant="secondary"
              size="small"
              onClick={() => setDenyAttendeeModalOpen(true)}
              className="w-full"
            >
              Deny
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
