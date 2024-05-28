import { Button, Detail, Checkbox } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import useEns from '~/hooks/useEns'
import { addressMinify } from '~/utils/strings'
import { BiCopy as CopyIcon } from 'react-icons/bi'
import useClipboard from 'react-use-clipboard'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { ApproveAttendeeModal } from './ApproveAttendeeModal'
import { DenyAttendeeModal } from './DenyAttendeeModal'

interface ApplicantInfoProps {
  network: number
  lockAddress: string
  owner: string
  metadata: any
  isSelected: boolean
  setIsSelected: (selected: boolean) => void
}

export const ApplicantInfo = ({
  network,
  lockAddress,
  owner,
  metadata,
  setIsSelected,
  isSelected,
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
      <ApproveAttendeeModal
        network={network}
        isOpen={approveAttendeeModalOpen}
        setIsOpen={setApproveAttendeeModalOpen}
        lockAddress={lockAddress}
        attendees={[
          {
            keyholderAddress: owner,
            ...metadata,
          },
        ]}
      />
      <DenyAttendeeModal
        network={network}
        isOpen={denyAttendeeModalOpen}
        setIsOpen={setDenyAttendeeModalOpen}
        lockAddress={lockAddress}
        attendees={[
          {
            keyholderAddress: owner,
            ...metadata,
          },
        ]}
      />

      <div className="flex md:flex-row flex-col gap-4 space-between w-full group relative">
        <div className="flex items-start pt-2 md:pt-1 mr-auto	md:ml-2">
          <Checkbox
            label=" "
            checked={isSelected}
            onChange={(event: any) => {
              setIsSelected(event.target.checked)
            }}
          />
        </div>
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
          className="w-full overflow-auto"
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

        <div className="md:hidden group-hover:flex absolute top-0 right-0">
          <div className="gap-2 flex flex-col ">
            {metadata.approval !== 'approved' && (
              <Button
                size="tiny"
                onClick={() => setApproveAttendeeModalOpen(true)}
                className="w-full"
              >
                Approve
              </Button>
            )}
            {metadata.approval !== 'denied' && (
              <Button
                variant="secondary"
                size="tiny"
                onClick={() => setDenyAttendeeModalOpen(true)}
                className="w-full"
              >
                Deny
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
