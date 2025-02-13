import { Button, Detail, Checkbox } from '@unlock-protocol/ui'
import React, { useState, useCallback } from 'react'
import { ApproveAttendeeModal } from './ApproveAttendeeModal'
import { DenyAttendeeModal } from './DenyAttendeeModal'
import { WrappedAddress } from '~/components/interface/WrappedAddress'

interface ApplicantInfoProps {
  network: number
  lockAddress: string
  owner: string
  metadata: any
  isSelected: boolean
  setIsSelected: (selected: boolean) => void
}

export const ApplicantInfo = React.memo(
  ({
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

    console.log('ApplicantInfo', metadata)

    const handleCheckboxChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log('Checkbox clicked:', {
          checked: event.target.checked,
          owner,
          metadata,
        })
        setIsSelected(event.target.checked)
      },
      [owner, metadata, setIsSelected]
    )

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
          <div className="flex items-start pt-2 md:pt-1 mr-auto md:ml-2">
            <Checkbox
              label=" "
              checked={isSelected}
              onChange={handleCheckboxChange}
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
            <WrappedAddress address={owner} showExternalLink={false} />
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
)

ApplicantInfo.displayName = 'ApplicantInfo'
export default ApplicantInfo
